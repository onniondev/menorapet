import { supabase } from '../lib/supabase'
import { localDayRangeISO } from '../lib/dateBounds'
import type { Reminder } from '../types/domain'

function sb() {
  if (!supabase) throw new Error('Supabase não configurado')
  return supabase
}

export async function fetchTodayReminders(clinicId: string, limit = 12): Promise<Reminder[]> {
  const { startIso, endIso } = localDayRangeISO()
  const { data, error } = await sb()
    .from('reminders')
    .select('id, clinic_id, pet_id, client_id, type, title, due_at, status, created_at')
    .eq('clinic_id', clinicId)
    .gte('due_at', startIso)
    .lte('due_at', endIso)
    .order('due_at', { ascending: true })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as Reminder[]
}

export async function listReminders(
  clinicId: string,
  opts?: { fromIso?: string; toIso?: string; status?: string; limit?: number },
): Promise<Reminder[]> {
  let q = sb().from('reminders').select('*').eq('clinic_id', clinicId).order('due_at', { ascending: true })
  if (opts?.fromIso) q = q.gte('due_at', opts.fromIso)
  if (opts?.toIso) q = q.lte('due_at', opts.toIso)
  if (opts?.status) q = q.eq('status', opts.status)
  if (opts?.limit) q = q.limit(opts.limit)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Reminder[]
}

export async function createReminder(
  clinicId: string,
  row: Pick<Reminder, 'type' | 'title' | 'due_at'> & Partial<Pick<Reminder, 'pet_id' | 'client_id' | 'status'>>,
): Promise<string> {
  const { data, error } = await sb()
    .from('reminders')
    .insert({
      clinic_id: clinicId,
      pet_id: row.pet_id ?? null,
      client_id: row.client_id ?? null,
      type: row.type.trim(),
      title: row.title.trim(),
      due_at: row.due_at,
      status: row.status ?? 'pending',
    })
    .select('id')
    .single()
  if (error) throw error
  return (data as { id: string }).id
}

export async function updateReminder(id: string, patch: Partial<Pick<Reminder, 'type' | 'title' | 'due_at' | 'status' | 'pet_id' | 'client_id'>>): Promise<void> {
  const { error } = await sb()
    .from('reminders')
    .update({
      ...(patch.type != null ? { type: patch.type.trim() } : {}),
      ...(patch.title != null ? { title: patch.title.trim() } : {}),
      ...(patch.due_at != null ? { due_at: patch.due_at } : {}),
      ...(patch.status != null ? { status: patch.status } : {}),
      ...(patch.pet_id !== undefined ? { pet_id: patch.pet_id } : {}),
      ...(patch.client_id !== undefined ? { client_id: patch.client_id } : {}),
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteReminder(id: string): Promise<void> {
  const { error } = await sb().from('reminders').delete().eq('id', id)
  if (error) throw error
}
