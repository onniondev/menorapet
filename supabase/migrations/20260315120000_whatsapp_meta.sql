-- PetVia — WhatsApp Business Cloud API (Meta)
-- Estende clients/messages/appointments; adiciona conversas, tickets e logs.

-- ---------------------------------------------------------------------------
-- Clínica: vínculo com phone_number_id da Meta (multi-número futuro)
-- ---------------------------------------------------------------------------

alter table public.clinics
  add column if not exists whatsapp_phone_number_id text;

create unique index if not exists idx_clinics_whatsapp_phone_number_id
  on public.clinics (whatsapp_phone_number_id)
  where whatsapp_phone_number_id is not null;

-- ---------------------------------------------------------------------------
-- Contact = clients (+ wa_id)
-- ---------------------------------------------------------------------------

alter table public.clients
  add column if not exists wa_id text;

create unique index if not exists idx_clients_clinic_wa_id
  on public.clients (clinic_id, wa_id)
  where wa_id is not null;

-- ---------------------------------------------------------------------------
-- Pet extras
-- ---------------------------------------------------------------------------

alter table public.pets
  add column if not exists notes text,
  add column if not exists age text;

-- ---------------------------------------------------------------------------
-- Conversations (multiatendimento)
-- ---------------------------------------------------------------------------

create table if not exists public.whatsapp_conversations (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  status text not null default 'open',
  assigned_to_id uuid references public.profiles (id) on delete set null,
  queue text not null default 'general',
  ai_assistance_enabled boolean not null default true,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint whatsapp_conversations_status_chk check (status in ('open', 'pending', 'closed')),
  constraint whatsapp_conversations_queue_chk check (
    queue in ('sales', 'support', 'veterinary', 'financial', 'general')
  )
);

create index if not exists idx_whatsapp_conversations_clinic_status
  on public.whatsapp_conversations (clinic_id, status, last_message_at desc);

create index if not exists idx_whatsapp_conversations_client_open
  on public.whatsapp_conversations (clinic_id, client_id)
  where status in ('open', 'pending');

-- ---------------------------------------------------------------------------
-- Messages (estende tabela existente)
-- ---------------------------------------------------------------------------

alter table public.messages
  add column if not exists conversation_id uuid references public.whatsapp_conversations (id) on delete set null,
  add column if not exists external_message_id text,
  add column if not exists sender_type text not null default 'client',
  add column if not exists raw_payload jsonb;

alter table public.messages
  drop constraint if exists messages_sender_type_chk;

alter table public.messages
  add constraint messages_sender_type_chk check (
    sender_type in ('client', 'agent', 'ai', 'system')
  );

create unique index if not exists idx_messages_clinic_external_id
  on public.messages (clinic_id, external_message_id)
  where external_message_id is not null;

-- ---------------------------------------------------------------------------
-- Tickets
-- ---------------------------------------------------------------------------

create table if not exists public.whatsapp_tickets (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  conversation_id uuid not null references public.whatsapp_conversations (id) on delete cascade,
  title text not null,
  priority text not null default 'medium',
  status text not null default 'open',
  sla_due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint whatsapp_tickets_priority_chk check (priority in ('low', 'medium', 'high', 'urgent')),
  constraint whatsapp_tickets_status_chk check (
    status in ('open', 'in_progress', 'resolved', 'closed')
  )
);

create index if not exists idx_whatsapp_tickets_conversation
  on public.whatsapp_tickets (conversation_id);

-- ---------------------------------------------------------------------------
-- Appointments: status requested
-- ---------------------------------------------------------------------------

alter table public.appointments drop constraint if exists appointments_status_chk;

alter table public.appointments
  add constraint appointments_status_chk check (
    status in ('requested', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show')
  );

-- ---------------------------------------------------------------------------
-- Webhook logs (debug / auditoria)
-- ---------------------------------------------------------------------------

create table if not exists public.whatsapp_webhook_logs (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics (id) on delete set null,
  event_type text,
  payload jsonb,
  error text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

drop trigger if exists whatsapp_conversations_set_updated on public.whatsapp_conversations;
create trigger whatsapp_conversations_set_updated
  before update on public.whatsapp_conversations
  for each row execute function public.set_updated_at();

drop trigger if exists whatsapp_tickets_set_updated on public.whatsapp_tickets;
create trigger whatsapp_tickets_set_updated
  before update on public.whatsapp_tickets
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.whatsapp_conversations enable row level security;
alter table public.whatsapp_tickets enable row level security;
alter table public.whatsapp_webhook_logs enable row level security;

create policy whatsapp_conversations_select_member
  on public.whatsapp_conversations for select
  to authenticated
  using (public.current_clinic_role(clinic_id) is not null);

create policy whatsapp_conversations_update_member
  on public.whatsapp_conversations for update
  to authenticated
  using (public.current_clinic_role(clinic_id) is not null)
  with check (public.current_clinic_role(clinic_id) is not null);

create policy whatsapp_tickets_select_member
  on public.whatsapp_tickets for select
  to authenticated
  using (public.current_clinic_role(clinic_id) is not null);

create policy whatsapp_tickets_update_member
  on public.whatsapp_tickets for update
  to authenticated
  using (public.current_clinic_role(clinic_id) is not null)
  with check (public.current_clinic_role(clinic_id) is not null);

-- webhook logs: apenas service_role (sem policy para authenticated)

grant select, update on public.whatsapp_conversations to authenticated;
grant select, update on public.whatsapp_tickets to authenticated;
grant all on public.whatsapp_webhook_logs to service_role;

revoke all on public.whatsapp_webhook_logs from authenticated, anon;
