import { query } from '../db/pool.ts'
import type { ConversationQueue } from '../types/whatsapp.ts'
import { getProviderForClinic } from './providers/getProviderForClinic.ts'
import { insertOutboundMessage } from './repositories.ts'

export async function assignConversation(conversationId: string, clinicId: string, userId: string) {
  const { rowCount } = await query(
    `update public.whatsapp_conversations
     set assigned_to_id = $3, status = 'pending', ai_assistance_enabled = false, updated_at = now()
     where id = $1 and clinic_id = $2`,
    [conversationId, clinicId, userId],
  )
  return (rowCount ?? 0) > 0
}

export async function transferConversation(
  conversationId: string,
  clinicId: string,
  queue: ConversationQueue,
  assignedToId?: string | null,
) {
  const { rowCount } = await query(
    `update public.whatsapp_conversations
     set queue = $3, assigned_to_id = $4, status = 'pending', updated_at = now()
     where id = $1 and clinic_id = $2`,
    [conversationId, clinicId, queue, assignedToId ?? null],
  )
  return (rowCount ?? 0) > 0
}

export async function closeConversation(conversationId: string, clinicId: string) {
  const { rowCount } = await query(
    `update public.whatsapp_conversations set status = 'closed', updated_at = now() where id = $1 and clinic_id = $2`,
    [conversationId, clinicId],
  )
  return (rowCount ?? 0) > 0
}

export async function sendAgentMessage(conversationId: string, clinicId: string, text: string) {
  const { rows } = await query<{
    client_id: string
    wa_id: string | null
    phone: string | null
    whatsapp_jid: string | null
  }>(
    `select c.client_id, cl.wa_id, cl.phone, cl.whatsapp_jid
     from public.whatsapp_conversations c
     join public.clients cl on cl.id = c.client_id
     where c.id = $1 and c.clinic_id = $2`,
    [conversationId, clinicId],
  )
  const row = rows[0]
  if (!row) throw new Error('Conversa não encontrada')
  const to = row.whatsapp_jid ?? row.wa_id ?? row.phone
  if (!to) throw new Error('Contato sem WhatsApp vinculado')

  const ctx = await getProviderForClinic(clinicId)
  if (!ctx) throw new Error('WhatsApp da clínica não está conectado. Conecte em Configurações → WhatsApp.')

  const sent = await ctx.provider.sendTextMessage(to, text)
  if (!sent.ok) throw new Error(sent.error)

  await insertOutboundMessage({
    clinicId,
    clientId: row.client_id,
    conversationId,
    content: text,
    senderType: 'agent',
    externalMessageId: sent.messageId,
  })

  return { messageId: sent.messageId }
}
