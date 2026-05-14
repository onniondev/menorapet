import { supabase } from '../lib/supabase'
import type { InventoryItem } from '../types/domain'

function sb() {
  if (!supabase) throw new Error('Supabase não configurado')
  return supabase
}

export async function listInventory(clinicId: string): Promise<InventoryItem[]> {
  const { data, error } = await sb().from('inventory_items').select('*').eq('clinic_id', clinicId).order('name')
  if (error) throw error
  return (data ?? []) as InventoryItem[]
}

export async function createInventoryItem(
  clinicId: string,
  row: Pick<InventoryItem, 'name'> &
    Partial<Pick<InventoryItem, 'sku' | 'quantity' | 'unit' | 'min_quantity' | 'category' | 'notes'>>,
): Promise<string> {
  const { data, error } = await sb()
    .from('inventory_items')
    .insert({
      clinic_id: clinicId,
      name: row.name.trim(),
      sku: row.sku?.trim() || null,
      quantity: row.quantity ?? 0,
      unit: row.unit?.trim() || 'un',
      min_quantity: row.min_quantity ?? 0,
      category: row.category?.trim() || null,
      notes: row.notes?.trim() || null,
    })
    .select('id')
    .single()
  if (error) throw error
  return (data as { id: string }).id
}

export async function updateInventoryItem(
  id: string,
  patch: Partial<Pick<InventoryItem, 'name' | 'sku' | 'quantity' | 'unit' | 'min_quantity' | 'category' | 'notes'>>,
): Promise<void> {
  const { error } = await sb()
    .from('inventory_items')
    .update({
      ...(patch.name != null ? { name: patch.name.trim() } : {}),
      ...(patch.sku !== undefined ? { sku: patch.sku?.trim() || null } : {}),
      ...(patch.quantity !== undefined ? { quantity: patch.quantity } : {}),
      ...(patch.unit !== undefined ? { unit: patch.unit?.trim() || 'un' } : {}),
      ...(patch.min_quantity !== undefined ? { min_quantity: patch.min_quantity } : {}),
      ...(patch.category !== undefined ? { category: patch.category?.trim() || null } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes?.trim() || null } : {}),
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const { error } = await sb().from('inventory_items').delete().eq('id', id)
  if (error) throw error
}
