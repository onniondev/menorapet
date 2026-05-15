-- PetVia — WhatsApp via Evolution API (QR Code) + extensões multiatendimento

-- ---------------------------------------------------------------------------
-- Instâncias WhatsApp por clínica
-- ---------------------------------------------------------------------------

create table if not exists public.whatsapp_instances (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  provider text not null default 'evolution',
  instance_name text not null unique,
  display_name text,
  phone_number text,
  status text not null default 'disconnected',
  qr_code text,
  connection_data jsonb,
  last_connected_at timestamptz,
  last_disconnected_at timestamptz,
  webhook_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint whatsapp_instances_provider_chk check (provider in ('evolution', 'meta_cloud')),
  constraint whatsapp_instances_status_chk check (
    status in ('disconnected', 'connecting', 'connected', 'qrcode', 'error')
  )
);

create unique index if not exists idx_whatsapp_instances_clinic_active
  on public.whatsapp_instances (clinic_id)
  where status in ('connected', 'connecting', 'qrcode');

create index if not exists idx_whatsapp_instances_instance_name
  on public.whatsapp_instances (instance_name);

-- ---------------------------------------------------------------------------
-- Contact (clients) — Evolution jid
-- ---------------------------------------------------------------------------

alter table public.clients
  add column if not exists whatsapp_jid text,
  add column if not exists source text not null default 'manual';

-- ---------------------------------------------------------------------------
-- Conversations — canal, instância, prioridade
-- ---------------------------------------------------------------------------

alter table public.whatsapp_conversations
  add column if not exists whatsapp_instance_id uuid references public.whatsapp_instances (id) on delete set null,
  add column if not exists channel text not null default 'whatsapp',
  add column if not exists priority text not null default 'medium';

alter table public.whatsapp_conversations
  drop constraint if exists whatsapp_conversations_priority_chk;

alter table public.whatsapp_conversations
  add constraint whatsapp_conversations_priority_chk check (
    priority in ('low', 'medium', 'high', 'urgent')
  );

-- ai_assistance_enabled já existe; alias lógico aiEnabled no app

-- ---------------------------------------------------------------------------
-- Messages — tipo e status de entrega
-- ---------------------------------------------------------------------------

alter table public.messages
  add column if not exists message_type text not null default 'text',
  add column if not exists delivery_status text not null default 'received';

alter table public.messages
  drop constraint if exists messages_delivery_status_chk;

alter table public.messages
  add constraint messages_delivery_status_chk check (
    delivery_status in ('sent', 'delivered', 'read', 'failed', 'received')
  );

alter table public.messages
  drop constraint if exists messages_message_type_chk;

alter table public.messages
  add constraint messages_message_type_chk check (
    message_type in ('text', 'image', 'audio', 'document', 'video', 'sticker', 'unknown')
  );

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

drop trigger if exists whatsapp_instances_set_updated on public.whatsapp_instances;
create trigger whatsapp_instances_set_updated
  before update on public.whatsapp_instances
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.whatsapp_instances enable row level security;

create policy whatsapp_instances_select_member
  on public.whatsapp_instances for select
  to authenticated
  using (public.current_clinic_role(clinic_id) is not null);

create policy whatsapp_instances_insert_staff
  on public.whatsapp_instances for insert
  to authenticated
  with check (public.current_clinic_role(clinic_id) in ('owner', 'admin', 'receptionist', 'assistant'));

create policy whatsapp_instances_update_staff
  on public.whatsapp_instances for update
  to authenticated
  using (public.current_clinic_role(clinic_id) in ('owner', 'admin', 'receptionist', 'assistant'))
  with check (public.current_clinic_role(clinic_id) in ('owner', 'admin', 'receptionist', 'assistant'));

grant select, insert, update on public.whatsapp_instances to authenticated;

-- Habilitar Realtime no Supabase Dashboard: Database → Replication → whatsapp_instances, messages
