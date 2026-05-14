-- PetVia — domínio operacional (clientes, pets, agenda, mensagens, financeiro, IA) + RLS por papel
-- Depende de: 20260214120000_petvia_foundation.sql (profiles, clinics, clinic_members)

-- ---------------------------------------------------------------------------
-- Coluna plan em clinics
-- ---------------------------------------------------------------------------

alter table public.clinics
  add column if not exists plan text not null default 'Starter';

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  species text,
  breed text,
  birth_date date,
  photo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  veterinarian_id uuid references public.profiles (id) on delete set null,
  service_type text not null,
  scheduled_at timestamptz not null,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  constraint appointments_status_chk check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show'))
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  pet_id uuid references public.pets (id) on delete set null,
  channel text not null default 'whatsapp',
  direction text not null default 'inbound',
  content text not null,
  status text not null default 'delivered',
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  constraint messages_direction_chk check (direction in ('inbound', 'outbound'))
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  appointment_id uuid references public.appointments (id) on delete set null,
  amount numeric(14, 2) not null,
  status text not null default 'pending',
  payment_method text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  constraint payments_status_chk check (status in ('pending', 'paid', 'failed', 'refunded'))
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  pet_id uuid references public.pets (id) on delete set null,
  client_id uuid references public.clients (id) on delete set null,
  type text not null,
  title text not null,
  due_at timestamptz not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint reminders_status_chk check (status in ('pending', 'done', 'skipped', 'snoozed'))
);

create table if not exists public.automations (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  name text not null,
  type text not null,
  status text not null default 'active',
  executions_count int not null default 0,
  created_at timestamptz not null default now(),
  constraint automations_status_chk check (status in ('active', 'paused', 'draft'))
);

create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  title text not null,
  description text,
  type text not null default 'info',
  priority text not null default 'normal',
  status text not null default 'open',
  created_at timestamptz not null default now(),
  constraint ai_insights_priority_chk check (priority in ('low', 'normal', 'high', 'critical')),
  constraint ai_insights_status_chk check (status in ('open', 'dismissed', 'resolved'))
);

-- ---------------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------------

create index if not exists idx_appointments_clinic_scheduled on public.appointments (clinic_id, scheduled_at);
create index if not exists idx_messages_clinic_read_created on public.messages (clinic_id, is_read, created_at desc);
create index if not exists idx_payments_clinic_status_paid on public.payments (clinic_id, status, paid_at);
create index if not exists idx_reminders_clinic_due on public.reminders (clinic_id, due_at);
create index if not exists idx_pets_clinic_client on public.pets (clinic_id, client_id);
create index if not exists idx_clients_clinic on public.clients (clinic_id);
create index if not exists idx_appointments_clinic_status on public.appointments (clinic_id, status);
create index if not exists idx_messages_clinic_client on public.messages (clinic_id, client_id);

-- ---------------------------------------------------------------------------
-- RLS — helpers por papel
-- ---------------------------------------------------------------------------

create or replace function public.current_clinic_role(p_clinic_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select m.role::text
  from public.clinic_members m
  where m.clinic_id = p_clinic_id
    and m.user_id = auth.uid()
    and m.status = 'active'
  limit 1;
$$;

create or replace function public.role_may_manage_clients(p_clinic_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_clinic_role(p_clinic_id) in ('owner', 'admin', 'receptionist', 'assistant');
$$;

create or replace function public.role_may_manage_billing(p_clinic_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_clinic_role(p_clinic_id) in ('owner', 'admin', 'receptionist', 'assistant');
$$;

create or replace function public.role_may_manage_automations(p_clinic_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_clinic_role(p_clinic_id) in ('owner', 'admin', 'receptionist', 'assistant');
$$;

create or replace function public.role_may_manage_ai_insights_write(p_clinic_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_clinic_role(p_clinic_id) in ('owner', 'admin');
$$;

grant execute on function public.current_clinic_role(uuid) to authenticated;
grant execute on function public.role_may_manage_clients(uuid) to authenticated;
grant execute on function public.role_may_manage_billing(uuid) to authenticated;
grant execute on function public.role_may_manage_automations(uuid) to authenticated;
grant execute on function public.role_may_manage_ai_insights_write(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.clients enable row level security;
alter table public.pets enable row level security;
alter table public.appointments enable row level security;
alter table public.messages enable row level security;
alter table public.payments enable row level security;
alter table public.reminders enable row level security;
alter table public.automations enable row level security;
alter table public.ai_insights enable row level security;

-- clients
drop policy if exists "clients_select_member" on public.clients;
create policy "clients_select_member" on public.clients for select to authenticated
  using (public.is_clinic_member(clinic_id));

drop policy if exists "clients_insert_staff" on public.clients;
create policy "clients_insert_staff" on public.clients for insert to authenticated
  with check (public.is_clinic_member(clinic_id) and public.role_may_manage_clients(clinic_id));

drop policy if exists "clients_update_staff" on public.clients;
create policy "clients_update_staff" on public.clients for update to authenticated
  using (public.is_clinic_member(clinic_id) and public.role_may_manage_clients(clinic_id))
  with check (public.is_clinic_member(clinic_id) and public.role_may_manage_clients(clinic_id));

drop policy if exists "clients_delete_admin" on public.clients;
create policy "clients_delete_admin" on public.clients for delete to authenticated
  using (public.is_clinic_member(clinic_id) and public.is_clinic_admin(clinic_id));

-- pets
drop policy if exists "pets_select_member" on public.pets;
create policy "pets_select_member" on public.pets for select to authenticated
  using (public.is_clinic_member(clinic_id));

drop policy if exists "pets_insert_member" on public.pets;
create policy "pets_insert_member" on public.pets for insert to authenticated
  with check (
    public.is_clinic_member(clinic_id)
    and public.current_clinic_role(clinic_id) in ('owner', 'admin', 'receptionist', 'assistant', 'veterinarian')
  );

drop policy if exists "pets_update_member" on public.pets;
create policy "pets_update_member" on public.pets for update to authenticated
  using (
    public.is_clinic_member(clinic_id)
    and public.current_clinic_role(clinic_id) in ('owner', 'admin', 'receptionist', 'assistant', 'veterinarian')
  )
  with check (
    public.is_clinic_member(clinic_id)
    and public.current_clinic_role(clinic_id) in ('owner', 'admin', 'receptionist', 'assistant', 'veterinarian')
  );

drop policy if exists "pets_delete_admin" on public.pets;
create policy "pets_delete_admin" on public.pets for delete to authenticated
  using (public.is_clinic_member(clinic_id) and public.is_clinic_admin(clinic_id));

-- appointments
drop policy if exists "appointments_select_member" on public.appointments;
create policy "appointments_select_member" on public.appointments for select to authenticated
  using (public.is_clinic_member(clinic_id));

drop policy if exists "appointments_insert_member" on public.appointments;
create policy "appointments_insert_member" on public.appointments for insert to authenticated
  with check (
    public.is_clinic_member(clinic_id)
    and public.current_clinic_role(clinic_id) in ('owner', 'admin', 'receptionist', 'assistant', 'veterinarian')
  );

drop policy if exists "appointments_update_member" on public.appointments;
create policy "appointments_update_member" on public.appointments for update to authenticated
  using (
    public.is_clinic_member(clinic_id)
    and public.current_clinic_role(clinic_id) in ('owner', 'admin', 'receptionist', 'assistant', 'veterinarian')
  )
  with check (
    public.is_clinic_member(clinic_id)
    and public.current_clinic_role(clinic_id) in ('owner', 'admin', 'receptionist', 'assistant', 'veterinarian')
  );

drop policy if exists "appointments_delete_admin" on public.appointments;
create policy "appointments_delete_admin" on public.appointments for delete to authenticated
  using (public.is_clinic_member(clinic_id) and public.is_clinic_admin(clinic_id));

-- messages
drop policy if exists "messages_select_member" on public.messages;
create policy "messages_select_member" on public.messages for select to authenticated
  using (public.is_clinic_member(clinic_id));

drop policy if exists "messages_insert_member" on public.messages;
create policy "messages_insert_member" on public.messages for insert to authenticated
  with check (public.is_clinic_member(clinic_id));

drop policy if exists "messages_update_member" on public.messages;
create policy "messages_update_member" on public.messages for update to authenticated
  using (public.is_clinic_member(clinic_id))
  with check (public.is_clinic_member(clinic_id));

drop policy if exists "messages_delete_admin" on public.messages;
create policy "messages_delete_admin" on public.messages for delete to authenticated
  using (public.is_clinic_member(clinic_id) and public.is_clinic_admin(clinic_id));

-- payments
drop policy if exists "payments_select_member" on public.payments;
create policy "payments_select_member" on public.payments for select to authenticated
  using (public.is_clinic_member(clinic_id));

drop policy if exists "payments_write_billing" on public.payments;
create policy "payments_write_billing" on public.payments for insert to authenticated
  with check (public.is_clinic_member(clinic_id) and public.role_may_manage_billing(clinic_id));

drop policy if exists "payments_update_billing" on public.payments;
create policy "payments_update_billing" on public.payments for update to authenticated
  using (public.is_clinic_member(clinic_id) and public.role_may_manage_billing(clinic_id))
  with check (public.is_clinic_member(clinic_id) and public.role_may_manage_billing(clinic_id));

drop policy if exists "payments_delete_admin" on public.payments;
create policy "payments_delete_admin" on public.payments for delete to authenticated
  using (public.is_clinic_member(clinic_id) and public.is_clinic_admin(clinic_id));

-- reminders
drop policy if exists "reminders_select_member" on public.reminders;
create policy "reminders_select_member" on public.reminders for select to authenticated
  using (public.is_clinic_member(clinic_id));

drop policy if exists "reminders_write_clinical" on public.reminders;
create policy "reminders_write_clinical" on public.reminders for insert to authenticated
  with check (
    public.is_clinic_member(clinic_id)
    and public.current_clinic_role(clinic_id) in ('owner', 'admin', 'receptionist', 'assistant', 'veterinarian')
  );

drop policy if exists "reminders_update_clinical" on public.reminders;
create policy "reminders_update_clinical" on public.reminders for update to authenticated
  using (
    public.is_clinic_member(clinic_id)
    and public.current_clinic_role(clinic_id) in ('owner', 'admin', 'receptionist', 'assistant', 'veterinarian')
  )
  with check (
    public.is_clinic_member(clinic_id)
    and public.current_clinic_role(clinic_id) in ('owner', 'admin', 'receptionist', 'assistant', 'veterinarian')
  );

drop policy if exists "reminders_delete_admin" on public.reminders;
create policy "reminders_delete_admin" on public.reminders for delete to authenticated
  using (public.is_clinic_member(clinic_id) and public.is_clinic_admin(clinic_id));

-- automations
drop policy if exists "automations_select_member" on public.automations;
create policy "automations_select_member" on public.automations for select to authenticated
  using (public.is_clinic_member(clinic_id));

drop policy if exists "automations_write_staff" on public.automations;
create policy "automations_write_staff" on public.automations for insert to authenticated
  with check (public.is_clinic_member(clinic_id) and public.role_may_manage_automations(clinic_id));

drop policy if exists "automations_update_staff" on public.automations;
create policy "automations_update_staff" on public.automations for update to authenticated
  using (public.is_clinic_member(clinic_id) and public.role_may_manage_automations(clinic_id))
  with check (public.is_clinic_member(clinic_id) and public.role_may_manage_automations(clinic_id));

drop policy if exists "automations_delete_admin" on public.automations;
create policy "automations_delete_admin" on public.automations for delete to authenticated
  using (public.is_clinic_member(clinic_id) and public.is_clinic_admin(clinic_id));

-- ai_insights
drop policy if exists "ai_insights_select_member" on public.ai_insights;
create policy "ai_insights_select_member" on public.ai_insights for select to authenticated
  using (public.is_clinic_member(clinic_id));

drop policy if exists "ai_insights_insert_admin" on public.ai_insights;
create policy "ai_insights_insert_admin" on public.ai_insights for insert to authenticated
  with check (public.is_clinic_member(clinic_id) and public.role_may_manage_ai_insights_write(clinic_id));

drop policy if exists "ai_insights_update_admin" on public.ai_insights;
create policy "ai_insights_update_admin" on public.ai_insights for update to authenticated
  using (public.is_clinic_member(clinic_id) and public.role_may_manage_ai_insights_write(clinic_id))
  with check (public.is_clinic_member(clinic_id) and public.role_may_manage_ai_insights_write(clinic_id));

drop policy if exists "ai_insights_delete_admin" on public.ai_insights;
create policy "ai_insights_delete_admin" on public.ai_insights for delete to authenticated
  using (public.is_clinic_member(clinic_id) and public.role_may_manage_ai_insights_write(clinic_id));

-- ---------------------------------------------------------------------------
-- Perfis: leitura de colegas da mesma clínica (ex.: nome do veterinário na agenda)
-- ---------------------------------------------------------------------------

drop policy if exists "profiles_select_clinic_peer" on public.profiles;
create policy "profiles_select_clinic_peer" on public.profiles for select to authenticated
  using (
    exists (
      select 1
      from public.clinic_members m1
      join public.clinic_members m2 on m1.clinic_id = m2.clinic_id
      where m1.user_id = auth.uid()
        and m2.user_id = public.profiles.id
        and m1.status = 'active'
        and m2.status = 'active'
    )
  );
