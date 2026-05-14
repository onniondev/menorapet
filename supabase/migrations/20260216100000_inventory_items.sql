-- PetVia — estoque (inventory) + metadados em automations
-- Depende de: 20260215120000_petvia_dashboard_domain.sql

-- ---------------------------------------------------------------------------
-- inventory_items
-- ---------------------------------------------------------------------------

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  name text not null,
  sku text,
  quantity int not null default 0 check (quantity >= 0),
  unit text not null default 'un',
  min_quantity int not null default 0 check (min_quantity >= 0),
  category text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_inventory_clinic on public.inventory_items (clinic_id);
create index if not exists idx_inventory_clinic_name on public.inventory_items (clinic_id, name);

drop trigger if exists inventory_items_set_updated on public.inventory_items;
create trigger inventory_items_set_updated before update on public.inventory_items
  for each row execute function public.set_updated_at();

alter table public.inventory_items enable row level security;

drop policy if exists "inventory_select_member" on public.inventory_items;
create policy "inventory_select_member" on public.inventory_items for select to authenticated
  using (public.is_clinic_member(clinic_id));

drop policy if exists "inventory_insert_member" on public.inventory_items;
create policy "inventory_insert_member" on public.inventory_items for insert to authenticated
  with check (
    public.is_clinic_member(clinic_id)
    and public.current_clinic_role(clinic_id) in ('owner', 'admin', 'receptionist', 'assistant', 'veterinarian')
  );

drop policy if exists "inventory_update_member" on public.inventory_items;
create policy "inventory_update_member" on public.inventory_items for update to authenticated
  using (
    public.is_clinic_member(clinic_id)
    and public.current_clinic_role(clinic_id) in ('owner', 'admin', 'receptionist', 'assistant', 'veterinarian')
  )
  with check (
    public.is_clinic_member(clinic_id)
    and public.current_clinic_role(clinic_id) in ('owner', 'admin', 'receptionist', 'assistant', 'veterinarian')
  );

drop policy if exists "inventory_delete_admin" on public.inventory_items;
create policy "inventory_delete_admin" on public.inventory_items for delete to authenticated
  using (public.is_clinic_member(clinic_id) and public.is_clinic_admin(clinic_id));

-- ---------------------------------------------------------------------------
-- automations: descrição (opcional)
-- ---------------------------------------------------------------------------

alter table public.automations add column if not exists description text;
