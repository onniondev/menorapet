import { supabase } from '../lib/supabase'
import type { Automation } from '../types/domain'

function sb() {
  if (!supabase) throw new Error('Supabase não configurado')
  return supabase
}

export async function listAutomations(clinicId: string): Promise<Automation[]> {
  const { data, error } = await sb().from('automations').select('*').eq('clinic_id', clinicId).order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Automation[]
}

export async function createAutomation(
  clinicId: string,
  row: Pick<Automation, 'name' | 'type'> & { description?: string | null },
): Promise<string> {
  const { data, error } = await sb()
    .from('automations')
    .insert({
      clinic_id: clinicId,
      name: row.name.trim(),
      type: row.type.trim(),
      status: 'draft',
      description: row.description?.trim() || null,
    })
    .select('id')
    .single()
  if (error) throw error
  return (data as { id: string }).id
}

export async function updateAutomationStatus(id: string, status: string): Promise<void> {
  const { error } = await sb().from('automations').update({ status }).eq('id', id)
  if (error) throw error
}

export async function incrementAutomationExecutions(id: string): Promise<void> {
  const { data: cur, error: e1 } = await sb().from('automations').select('executions_count').eq('id', id).single()
  if (e1) throw e1
  const n = Number((cur as { executions_count: number }).executions_count ?? 0)
  const { error } = await sb().from('automations').update({ executions_count: n + 1 }).eq('id', id)
  if (error) throw error
}

export async function deleteAutomation(id: string): Promise<void> {
  const { error } = await sb().from('automations').delete().eq('id', id)
  if (error) throw error
}
