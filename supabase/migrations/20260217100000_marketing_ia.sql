-- PetVia — Marketing IA (posts internos Instagram) + admins PetVia + RLS
-- Depende de: 20260214120000_petvia_foundation.sql (auth.users / profiles)

-- ---------------------------------------------------------------------------
-- Extensões (cron opcional; ver 20260217100010_marketing_cron.sql)
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Admins internos PetVia
-- ---------------------------------------------------------------------------

create table if not exists public.petvia_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create index if not exists idx_petvia_admins_role on public.petvia_admins (role);

-- ---------------------------------------------------------------------------
-- Função: é admin PetVia?
-- ---------------------------------------------------------------------------

create or replace function public.is_petvia_admin(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.petvia_admins a where a.user_id = p_user_id
  );
$$;

revoke all on function public.is_petvia_admin(uuid) from public;
grant execute on function public.is_petvia_admin(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- Posts de marketing
-- ---------------------------------------------------------------------------

create table if not exists public.marketing_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  caption text not null default '',
  cta text not null default '',
  hashtags text[] not null default '{}',
  format text not null,
  objective text not null,
  tone text,
  target_audience text,
  extra_context text,
  visual_prompt text,
  visual_script text,
  image_url text,
  status text not null default 'draft',
  scheduled_at timestamptz,
  published_at timestamptz,
  instagram_media_id text,
  instagram_permalink text,
  leads_count int not null default 0,
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketing_posts_format_chk check (
    format in ('single', 'carousel', 'reels_script', 'story')
  ),
  constraint marketing_posts_objective_chk check (
    objective in (
      'leads',
      'educate',
      'benefits',
      'social_proof',
      'promotion',
      'before_after'
    )
  ),
  constraint marketing_posts_status_chk check (
    status in ('draft', 'approved', 'scheduled', 'published', 'rejected')
  )
);

create index if not exists idx_marketing_posts_status on public.marketing_posts (status);
create index if not exists idx_marketing_posts_scheduled on public.marketing_posts (status, scheduled_at);

-- ---------------------------------------------------------------------------
-- Variações A/B
-- ---------------------------------------------------------------------------

create table if not exists public.marketing_post_variants (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.marketing_posts (id) on delete cascade,
  variant_name text not null,
  title text not null default '',
  caption text not null default '',
  cta text not null default '',
  hashtags text[] not null default '{}',
  score numeric,
  created_at timestamptz not null default now()
);

create index if not exists idx_marketing_post_variants_post on public.marketing_post_variants (post_id);

-- ---------------------------------------------------------------------------
-- Conta Instagram (metadados — token em tabela separada, sem exposição ao PostgREST comum)
-- ---------------------------------------------------------------------------

create table if not exists public.instagram_accounts (
  id uuid primary key default gen_random_uuid(),
  account_name text not null,
  instagram_user_id text not null,
  token_expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tokens: apenas service_role / Edge Functions (RLS sem policy para authenticated)
create table if not exists public.instagram_account_access_tokens (
  account_id uuid primary key references public.instagram_accounts (id) on delete cascade,
  access_token text not null,
  updated_at timestamptz not null default now()
);

alter table public.instagram_account_access_tokens enable row level security;

-- ---------------------------------------------------------------------------
-- Métricas
-- ---------------------------------------------------------------------------

create table if not exists public.marketing_post_metrics (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.marketing_posts (id) on delete cascade,
  likes_count int not null default 0,
  comments_count int not null default 0,
  reach int not null default 0,
  impressions int not null default 0,
  saves int not null default 0,
  shares int not null default 0,
  collected_at timestamptz not null default now()
);

create index if not exists idx_marketing_post_metrics_post on public.marketing_post_metrics (post_id, collected_at desc);

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

drop trigger if exists marketing_posts_set_updated on public.marketing_posts;
create trigger marketing_posts_set_updated
  before update on public.marketing_posts
  for each row execute function public.set_updated_at();

drop trigger if exists instagram_accounts_set_updated on public.instagram_accounts;
create trigger instagram_accounts_set_updated
  before update on public.instagram_accounts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.petvia_admins enable row level security;
alter table public.marketing_posts enable row level security;
alter table public.marketing_post_variants enable row level security;
alter table public.instagram_accounts enable row level security;
alter table public.marketing_post_metrics enable row level security;

-- petvia_admins: usuário vê apenas a própria linha (saber se é admin)
create policy petvia_admins_select_self
  on public.petvia_admins for select
  to authenticated
  using (user_id = auth.uid());

-- marketing_posts
create policy marketing_posts_select_admin
  on public.marketing_posts for select
  to authenticated
  using (public.is_petvia_admin(auth.uid()));

create policy marketing_posts_insert_admin
  on public.marketing_posts for insert
  to authenticated
  with check (public.is_petvia_admin(auth.uid()) and created_by = auth.uid());

create policy marketing_posts_update_admin
  on public.marketing_posts for update
  to authenticated
  using (public.is_petvia_admin(auth.uid()))
  with check (public.is_petvia_admin(auth.uid()));

create policy marketing_posts_delete_admin
  on public.marketing_posts for delete
  to authenticated
  using (public.is_petvia_admin(auth.uid()));

-- marketing_post_variants
create policy marketing_post_variants_all_admin
  on public.marketing_post_variants for all
  to authenticated
  using (
    public.is_petvia_admin(auth.uid())
    and exists (
      select 1 from public.marketing_posts p
      where p.id = marketing_post_variants.post_id
    )
  )
  with check (
    public.is_petvia_admin(auth.uid())
    and exists (
      select 1 from public.marketing_posts p
      where p.id = marketing_post_variants.post_id
    )
  );

-- instagram_accounts: apenas admins internos, sem coluna de token nesta tabela
create policy instagram_accounts_select_admin
  on public.instagram_accounts for select
  to authenticated
  using (public.is_petvia_admin(auth.uid()));

create policy instagram_accounts_write_admin
  on public.instagram_accounts for insert
  to authenticated
  with check (public.is_petvia_admin(auth.uid()));

create policy instagram_accounts_update_admin
  on public.instagram_accounts for update
  to authenticated
  using (public.is_petvia_admin(auth.uid()))
  with check (public.is_petvia_admin(auth.uid()));

create policy instagram_accounts_delete_admin
  on public.instagram_accounts for delete
  to authenticated
  using (public.is_petvia_admin(auth.uid()));

-- marketing_post_metrics
create policy marketing_post_metrics_all_admin
  on public.marketing_post_metrics for all
  to authenticated
  using (
    public.is_petvia_admin(auth.uid())
    and exists (
      select 1 from public.marketing_posts p
      where p.id = marketing_post_metrics.post_id
    )
  )
  with check (
    public.is_petvia_admin(auth.uid())
    and exists (
      select 1 from public.marketing_posts p
      where p.id = marketing_post_metrics.post_id
    )
  );

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant select on public.petvia_admins to authenticated;
grant select, insert, update, delete on public.marketing_posts to authenticated;
grant select, insert, update, delete on public.marketing_post_variants to authenticated;
grant select, insert, update, delete on public.instagram_accounts to authenticated;
grant select, insert, update, delete on public.marketing_post_metrics to authenticated;

-- service_role já ignora RLS para operações administrativas

comment on table public.marketing_posts is 'Posts institucionais PetVia (Instagram). Fluxo: draft → approved → scheduled|published.';
comment on table public.instagram_account_access_tokens is 'Tokens Meta/Instagram — use apenas Edge Functions com service_role; sem policies para authenticated.';

-- Tokens: não expor via PostgREST para anon/authenticated
revoke all on public.instagram_account_access_tokens from public;
revoke all on public.instagram_account_access_tokens from anon;
revoke all on public.instagram_account_access_tokens from authenticated;
grant all on public.instagram_account_access_tokens to service_role;
