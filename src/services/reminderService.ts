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
