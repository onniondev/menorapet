-- Petvia IA — fundação: perfis, clínicas, membros, convites, auditoria + RLS
-- Execute no SQL Editor do Supabase ou via CLI: supabase db push

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  phone text,
  whatsapp_number text,
  email text,
  logo_url text,
  address text,
  city text,
  state text,
  country text not null default 'Brasil',
  timezone text not null default 'America/Sao_Paulo',
  opening_hours text,
  vet_count int,
  main_services text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clinic_members (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'veterinarian', 'receptionist', 'assistant')),
  status text not null default 'active' check (status in ('active', 'invited', 'suspended')),
  created_at timestamptz not null default now(),
  unique (clinic_id, user_id)
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  email text not null,
  role text not null check (role in ('owner', 'admin', 'veterinarian', 'receptionist', 'assistant')),
  token text not null unique,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_clinic_members_user on public.clinic_members (user_id);
create index if not exists idx_clinic_members_clinic on public.clinic_members (clinic_id);
create index if not exists idx_audit_logs_clinic on public.audit_logs (clinic_id);

-- ---------------------------------------------------------------------------
-- Trigger: perfil ao registrar
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated on public.profiles;
create trigger profiles_set_updated before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists clinics_set_updated on public.clinics;
create trigger clinics_set_updated before update on public.clinics
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Funções auxiliares (RLS)
-- ---------------------------------------------------------------------------

create or replace function public.is_clinic_member(p_clinic_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.clinic_members m
    where m.clinic_id = p_clinic_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.is_clinic_admin(p_clinic_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.clinic_members m
    where m.clinic_id = p_clinic_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role in ('owner', 'admin')
  );
$$;

grant execute on function public.is_clinic_member(uuid) to authenticated;
grant execute on function public.is_clinic_admin(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- RPC: criar clínica + owner (bypass RLS de membros)
-- ---------------------------------------------------------------------------

create or replace function public.create_clinic_onboarding(
  p_clinic_name text,
  p_phone text,
  p_whatsapp text,
  p_email text,
  p_city text,
  p_state text,
  p_opening_hours text,
  p_vet_count int,
  p_main_services text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clinic_id uuid;
  v_slug text;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if exists (select 1 from public.clinic_members where user_id = auth.uid() and status = 'active') then
    raise exception 'user_already_has_clinic';
  end if;

  v_slug := lower(regexp_replace(trim(p_clinic_name), '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug) || '-' || substring(replace(gen_random_uuid()::text, '-', ''), 1, 10);

  insert into public.clinics (
    name, slug, phone, whatsapp_number, email, city, state,
    opening_hours, vet_count, main_services
  )
  values (
    trim(p_clinic_name), v_slug, nullif(trim(p_phone), ''), nullif(trim(p_whatsapp), ''),
    nullif(trim(p_email), ''), nullif(trim(p_city), ''), nullif(trim(p_state), ''),
    nullif(trim(p_opening_hours), ''), p_vet_count, nullif(trim(p_main_services), '')
  )
  returning id into v_clinic_id;

  insert into public.clinic_members (clinic_id, user_id, role, status)
  values (v_clinic_id, auth.uid(), 'owner', 'active');

  insert into public.audit_logs (clinic_id, user_id, action, entity_type, entity_id, metadata)
  values (
    v_clinic_id, auth.uid(), 'clinic.created', 'clinic', v_clinic_id,
    jsonb_build_object('name', p_clinic_name, 'slug', v_slug)
  );

  return v_clinic_id;
end;
$$;

grant execute on function public.create_clinic_onboarding(
  text, text, text, text, text, text, text, int, text
) to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.clinics enable row level security;
alter table public.clinic_members enable row level security;
alter table public.invitations enable row level security;
alter table public.audit_logs enable row level security;

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- clinics
drop policy if exists "clinics_select_member" on public.clinics;
create policy "clinics_select_member" on public.clinics for select to authenticated
  using (public.is_clinic_member(id));

drop policy if exists "clinics_update_admin" on public.clinics;
create policy "clinics_update_admin" on public.clinics for update to authenticated
  using (public.is_clinic_admin(id)) with check (public.is_clinic_admin(id));

-- clinic_members
drop policy if exists "clinic_members_select" on public.clinic_members;
create policy "clinic_members_select" on public.clinic_members for select to authenticated
  using (user_id = auth.uid() or public.is_clinic_member(clinic_id));

drop policy if exists "clinic_members_insert_admin" on public.clinic_members;
create policy "clinic_members_insert_admin" on public.clinic_members for insert to authenticated
  with check (public.is_clinic_admin(clinic_id));

drop policy if exists "clinic_members_update_admin" on public.clinic_members;
create policy "clinic_members_update_admin" on public.clinic_members for update to authenticated
  using (public.is_clinic_admin(clinic_id)) with check (public.is_clinic_admin(clinic_id));

drop policy if exists "clinic_members_delete_admin" on public.clinic_members;
create policy "clinic_members_delete_admin" on public.clinic_members for delete to authenticated
  using (public.is_clinic_admin(clinic_id));

-- invitations
drop policy if exists "invitations_select" on public.invitations;
create policy "invitations_select" on public.invitations for select to authenticated
  using (
    public.is_clinic_admin(clinic_id)
    or lower(email) = lower((select p.email from public.profiles p where p.id = auth.uid()))
  );

drop policy if exists "invitations_insert_admin" on public.invitations;
create policy "invitations_insert_admin" on public.invitations for insert to authenticated
  with check (public.is_clinic_admin(clinic_id));

drop policy if exists "invitations_update_admin" on public.invitations;
create policy "invitations_update_admin" on public.invitations for update to authenticated
  using (public.is_clinic_admin(clinic_id)) with check (public.is_clinic_admin(clinic_id));

-- audit_logs
drop policy if exists "audit_select_member" on public.audit_logs;
create policy "audit_select_member" on public.audit_logs for select to authenticated
  using (public.is_clinic_member(clinic_id));

drop policy if exists "audit_insert_member" on public.audit_logs;
create policy "audit_insert_member" on public.audit_logs for insert to authenticated
  with check (public.is_clinic_member(clinic_id));
