import { supabase } from '../lib/supabase'
import { listClients } from './clientService'

function sb() {
  if (!supabase) throw new Error('Supabase não configurado')
  return supabase
}

export type MessageRow = {
  id: string
  clinic_id: string
  client_id: string | null
  pet_id: string | null
  direction: 'inbound' | 'outbound'
  content: string
  is_read: boolean
  created_at: string
}

export type ThreadSummary = {
  client_id: string
  client_name: string
  last_preview: string
  last_at: string
  unread: number
}

export async function listThreads(clinicId: string): Promise<ThreadSummary[]> {
  const { data, error } = await sb()
    .from('messages')
    .select('id, client_id, content, is_read, created_at, direction')
    .eq('clinic_id', clinicId)
    .not('client_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) throw error
  const rows = (data ?? []) as { id: string; client_id: string; content: string; is_read: boolean; created_at: string; direction: string }[]
  const clients = await listClients(clinicId)
  const nameBy = new Map(clients.map((c) => [c.id, c.name]))
  const latest = new Map<string, { preview: string; at: string }>()
  const unreadCounts = new Map<string, number>()
  for (const m of rows) {
    if (!latest.has(m.client_id)) latest.set(m.client_id, { preview: m.content, at: m.created_at })
    if (!m.is_read && m.direction === 'inbound') {
      unreadCounts.set(m.client_id, (unreadCounts.get(m.client_id) ?? 0) + 1)
    }
  }
  return [...latest.entries()]
    .map(([client_id, v]) => ({
      client_id,
      client_name: nameBy.get(client_id) ?? 'Cliente',
      last_preview: v.preview,
      last_at: v.at,
      unread: unreadCounts.get(client_id) ?? 0,
    }))
    .sort((a, b) => new Date(b.last_at).getTime() - new Date(a.last_at).getTime())
}

export async function listMessagesForClient(clinicId: string, clientId: string): Promise<MessageRow[]> {
  const { data, error } = await sb()
    .from('messages')
    .select('id, clinic_id, client_id, pet_id, direction, content, is_read, created_at')
    .eq('clinic_id', clinicId)
    .eq('client_id', clientId)
    .order('created_at', { ascending: true })
    .limit(200)
  if (error) throw error
  return (data ?? []) as MessageRow[]
}

export async function sendOutboundMessage(clinicId: string, clientId: string, petId: string | null, text: string): Promise<void> {
  const { error } = await sb().from('messages').insert({
    clinic_id: clinicId,
    client_id: clientId,
    pet_id: petId,
    channel: 'whatsapp',
    direction: 'outbound',
    content: text.trim(),
    status: 'delivered',
    is_read: true,
  })
  if (error) throw error
}

export async function markThreadRead(clinicId: string, clientId: string): Promise<void> {
  const { error } = await sb().from('messages').update({ is_read: true }).eq('clinic_id', clinicId).eq('client_id', clientId).eq('is_read', false)
  if (error) throw error
}
