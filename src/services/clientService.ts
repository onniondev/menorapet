import { supabase } from '../lib/supabase'
import type { Client } from '../types/domain'

function sb() {
  if (!supabase) throw new Error('Supabase não configurado')
  return supabase
}

export async function listClients(clinicId: string, search?: string): Promise<Client[]> {
  let q = sb().from('clients').select('*').eq('clinic_id', clinicId).order('name', { ascending: true })
  const s = search?.trim().replace(/%/g, '')
  if (s) q = q.or(`name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Client[]
}

export async function createClient(clinicId: string, row: Pick<Client, 'name'> & Partial<Pick<Client, 'phone' | 'email'>>): Promise<string> {
  const { data, error } = await sb()
    .from('clients')
    .insert({ clinic_id: clinicId, name: row.name.trim(), phone: row.phone?.trim() || null, email: row.email?.trim() || null })
    .select('id')
    .single()
  if (error) throw error
  return (data as { id: string }).id
}

export async function updateClient(id: string, patch: Partial<Pick<Client, 'name' | 'phone' | 'email'>>): Promise<void> {
  const { error } = await sb()
    .from('clients')
    .update({
      ...(patch.name != null ? { name: patch.name.trim() } : {}),
      ...(patch.phone !== undefined ? { phone: patch.phone?.trim() || null } : {}),
      ...(patch.email !== undefined ? { email: patch.email?.trim() || null } : {}),
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await sb().from('clients').delete().eq('id', id)
  if (error) throw error
}

export async function getClient(id: string): Promise<Client | null> {
  const { data, error } = await sb().from('clients').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return (data as Client) ?? null
}
