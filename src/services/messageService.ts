import { supabase } from '../lib/supabase'
import { localDayRangeISO } from '../lib/dateBounds'
import type { MessageWithClient } from '../types/domain'

function sb() {
  if (!supabase) throw new Error('Supabase não configurado')
  return supabase
}

export async function countUnreadMessages(clinicId: string): Promise<number> {
  const { count, error } = await sb()
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .eq('is_read', false)
  if (error) throw error
  return count ?? 0
}

export async function countMessagesThisMonth(clinicId: string): Promise<number> {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
  const { endIso } = localDayRangeISO(now)
  const { count, error } = await sb()
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .gte('created_at', start.toISOString())
    .lte('created_at', endIso)
  if (error) throw error
  return count ?? 0
}

export async function fetchUnreadMessagesPreview(clinicId: string, limit = 6): Promise<MessageWithClient[]> {
  const { data, error } = await sb()
    .from('messages')
    .select('id, clinic_id, client_id, pet_id, channel, direction, content, status, is_read, created_at')
    .eq('clinic_id', clinicId)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error

  type Row = {
    id: string
    clinic_id: string
    client_id: string | null
    pet_id: string | null
    channel: string
    direction: 'inbound' | 'outbound'
    content: string
    status: string
    is_read: boolean
    created_at: string
  }

  const rows = (data ?? []) as Row[]
  const clientIds = [...new Set(rows.map((r) => r.client_id).filter(Boolean))] as string[]
  let nameById = new Map<string, string>()
  if (clientIds.length) {
    const { data: clients, error: e2 } = await sb().from('clients').select('id, name').in('id', clientIds)
    if (e2) throw e2
    nameById = new Map((clients ?? []).map((c) => [c.id as string, String((c as { name: string }).name)]))
  }

  return rows.map((r) => ({
    id: r.id,
    clinic_id: r.clinic_id,
    client_id: r.client_id,
    pet_id: r.pet_id,
    channel: r.channel,
    direction: r.direction,
    content: r.content,
    status: r.status,
    is_read: r.is_read,
    created_at: r.created_at,
    client_name: r.client_id ? nameById.get(r.client_id) ?? null : null,
  }))
}

export async function distinctClientIdsWithMessageSince(clinicId: string, sinceIso: string): Promise<Set<string>> {
  const { data, error } = await sb()
    .from('messages')
    .select('client_id')
    .eq('clinic_id', clinicId)
    .not('client_id', 'is', null)
    .gte('created_at', sinceIso)
  if (error) throw error
  return new Set((data ?? []).map((r) => (r as { client_id: string }).client_id).filter(Boolean))
}
