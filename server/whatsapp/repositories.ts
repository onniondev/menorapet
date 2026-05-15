import { query } from '../db/pool.ts'
import type { ClinicRow, ClientRow, ConversationRow, ConversationQueue, MessageRow } from '../types/whatsapp.ts'

export async function resolveClinicByInstanceName(instanceName: string): Promise<ClinicRow | null> {
  const { rows } = await query<ClinicRow & { clinic_id: string }>(
    `select c.id, c.name, c.phone, c.whatsapp_number, c.city, c.address, c.opening_hours, c.whatsapp_phone_number_id
     from public.whatsapp_instances wi
     join public.clinics c on c.id = wi.clinic_id
     where wi.instance_name = $1 limit 1`,
    [instanceName],
  )
  return rows[0] ?? null
}

export async function resolveClinicByPhoneNumberId(phoneNumberId: string): Promise<ClinicRow | null> {
  const defaultClinicId = process.env.DEFAULT_CLINIC_ID
  const { rows } = await query<ClinicRow>(
    `select id, name, phone, whatsapp_number, city, address, opening_hours, whatsapp_phone_number_id
     from public.clinics
     where whatsapp_phone_number_id = $1
     limit 1`,
    [phoneNumberId],
  )
  if (rows[0]) return rows[0]
  if (defaultClinicId) {
    const r2 = await query<ClinicRow>(
      `select id, name, phone, whatsapp_number, city, address, opening_hours, whatsapp_phone_number_id
       from public.clinics where id = $1 limit 1`,
      [defaultClinicId],
    )
    return r2.rows[0] ?? null
  }
  const r3 = await query<ClinicRow>(
    `select id, name, phone, whatsapp_number, city, address, opening_hours, whatsapp_phone_number_id
     from public.clinics order by created_at asc limit 1`,
  )
  return r3.rows[0] ?? null
}

export async function findMessageByExternalId(clinicId: string, externalId: string): Promise<boolean> {
  const { rows } = await query<{ id: string }>(
    `select id from public.messages where clinic_id = $1 and external_message_id = $2 limit 1`,
    [clinicId, externalId],
  )
  return rows.length > 0
}

export async function upsertClientFromWhatsApp(
  clinicId: string,
  waId: string,
  name: string,
  phone: string,
): Promise<ClientRow> {
  return upsertClientFromEvolution(clinicId, waId.includes('@') ? waId : `${waId}@s.whatsapp.net`, name, phone)
}

export async function upsertClientFromEvolution(
  clinicId: string,
  jid: string,
  name: string,
  phone: string,
): Promise<ClientRow> {
  const waDigits = phone.replace(/\D/g, '')
  const { rows: existing } = await query<ClientRow>(
    `select id, clinic_id, name, phone, wa_id, whatsapp_jid
     from public.clients
     where clinic_id = $1 and (whatsapp_jid = $2 or wa_id = $3)
     limit 1`,
    [clinicId, jid, waDigits || phone],
  )
  if (existing[0]) {
    await query(
      `update public.clients
       set name = coalesce(nullif($2,''), name),
           phone = coalesce(nullif($3,''), phone),
           whatsapp_jid = coalesce(whatsapp_jid, $4),
           wa_id = coalesce(wa_id, $5),
           source = 'whatsapp'
       where id = $1`,
      [existing[0].id, name, phone, jid, waDigits || null],
    )
    return { ...existing[0], whatsapp_jid: existing[0].whatsapp_jid ?? jid }
  }
  const { rows } = await query<ClientRow>(
    `insert into public.clients (clinic_id, name, phone, wa_id, whatsapp_jid, source)
     values ($1, $2, $3, $4, $5, 'whatsapp')
     returning id, clinic_id, name, phone, wa_id, whatsapp_jid`,
    [clinicId, name || 'Cliente WhatsApp', phone, waDigits || null, jid],
  )
  return rows[0]!
}

export async function getOpenConversation(clinicId: string, clientId: string): Promise<ConversationRow | null> {
  const { rows } = await query<ConversationRow>(
    `select id, clinic_id, client_id, status, assigned_to_id, queue, ai_assistance_enabled,
            last_message_at::text, whatsapp_instance_id
     from public.whatsapp_conversations
     where clinic_id = $1 and client_id = $2 and status in ('open', 'pending')
     order by last_message_at desc limit 1`,
    [clinicId, clientId],
  )
  return rows[0] ?? null
}

export async function createConversation(
  clinicId: string,
  clientId: string,
  queue: ConversationQueue = 'general',
  whatsappInstanceId?: string,
): Promise<ConversationRow> {
  const { rows } = await query<ConversationRow>(
    `insert into public.whatsapp_conversations (clinic_id, client_id, status, queue, whatsapp_instance_id)
     values ($1, $2, 'open', $3, $4)
     returning id, clinic_id, client_id, status, assigned_to_id, queue, ai_assistance_enabled,
               last_message_at::text, whatsapp_instance_id`,
    [clinicId, clientId, queue, whatsappInstanceId ?? null],
  )
  return rows[0]!
}

export async function insertInboundMessage(opts: {
  clinicId: string
  clientId: string
  conversationId: string
  externalMessageId: string
  content: string
  rawPayload: unknown
}): Promise<MessageRow> {
  const { rows } = await query<MessageRow>(
    `insert into public.messages (
       clinic_id, client_id, conversation_id, channel, direction, content, status, is_read,
       external_message_id, sender_type, raw_payload
     ) values ($1, $2, $3, 'whatsapp', 'inbound', $4, 'delivered', false, $5, 'client', $6::jsonb)
     returning id, conversation_id, direction, sender_type, content, external_message_id, created_at::text`,
    [
      opts.clinicId,
      opts.clientId,
      opts.conversationId,
      opts.content,
      opts.externalMessageId,
      JSON.stringify(opts.rawPayload ?? {}),
    ],
  )
  await query(
    `update public.whatsapp_conversations set last_message_at = now(), updated_at = now() where id = $1`,
    [opts.conversationId],
  )
  return rows[0]!
}

export async function insertOutboundMessage(opts: {
  clinicId: string
  clientId: string
  conversationId: string
  content: string
  senderType: 'ai' | 'agent' | 'system'
  externalMessageId?: string | null
}): Promise<MessageRow> {
  const { rows } = await query<MessageRow>(
    `insert into public.messages (
       clinic_id, client_id, conversation_id, channel, direction, content, status, is_read,
       external_message_id, sender_type
     ) values ($1, $2, $3, 'whatsapp', 'outbound', $4, 'delivered', true, $5, $6)
     returning id, conversation_id, direction, sender_type, content, external_message_id, created_at::text`,
    [opts.clinicId, opts.clientId, opts.conversationId, opts.content, opts.externalMessageId ?? null, opts.senderType],
  )
  await query(
    `update public.whatsapp_conversations set last_message_at = now(), updated_at = now() where id = $1`,
    [opts.conversationId],
  )
  return rows[0]!
}

export async function getConversationHistory(conversationId: string, limit = 20): Promise<MessageRow[]> {
  const { rows } = await query<MessageRow>(
    `select id, conversation_id, direction, sender_type, content, external_message_id, created_at::text
     from public.messages where conversation_id = $1 order by created_at asc limit $2`,
    [conversationId, limit],
  )
  return rows
}

export async function getPrimaryPet(clientId: string) {
  const { rows } = await query<{ name: string; species: string | null; age: string | null }>(
    `select name, species, age from public.pets where client_id = $1 order by created_at desc limit 1`,
    [clientId],
  )
  return rows[0] ?? null
}

export async function createUrgentTicket(clinicId: string, conversationId: string, title: string) {
  await query(
    `insert into public.whatsapp_tickets (clinic_id, conversation_id, title, priority, status, sla_due_at)
     values ($1, $2, $3, 'urgent', 'open', now() + interval '30 minutes')`,
    [clinicId, conversationId, title],
  )
}

export async function assignConversationHuman(
  conversationId: string,
  queue: ConversationQueue,
  disableAi = true,
) {
  await query(
    `update public.whatsapp_conversations
     set status = 'pending', queue = $2, ai_assistance_enabled = $3, assigned_to_id = null, updated_at = now()
     where id = $1`,
    [conversationId, queue, !disableAi],
  )
}

export async function logWebhook(clinicId: string | null, eventType: string, payload: unknown, error?: string) {
  await query(
    `insert into public.whatsapp_webhook_logs (clinic_id, event_type, payload, error) values ($1, $2, $3::jsonb, $4)`,
    [clinicId, eventType, JSON.stringify(payload), error ?? null],
  )
}

export type ListConversationsFilters = {
  status?: string
  queue?: string
  unassigned?: boolean
  search?: string
}

export async function listConversations(clinicId: string, filters: ListConversationsFilters = {}) {
  const params: unknown[] = [clinicId]
  let sql = `
    select c.id, c.clinic_id, c.client_id, c.status, c.assigned_to_id, c.queue, c.ai_assistance_enabled,
           c.priority, c.last_message_at, c.created_at, c.updated_at,
           cl.name as contact_name, cl.phone, cl.wa_id, cl.whatsapp_jid
    from public.whatsapp_conversations c
    join public.clients cl on cl.id = c.client_id
    where c.clinic_id = $1`
  if (filters.status) {
    params.push(filters.status)
    sql += ` and c.status = $${params.length}`
  }
  if (filters.queue) {
    params.push(filters.queue)
    sql += ` and c.queue = $${params.length}`
  }
  if (filters.unassigned) {
    sql += ` and c.assigned_to_id is null and c.status in ('open', 'pending')`
  }
  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`)
    sql += ` and (cl.name ilike $${params.length} or cl.phone ilike $${params.length})`
  }
  sql += ` order by c.last_message_at desc limit 100`
  const { rows } = await query(sql, params)
  return rows
}

export async function listConversationMessages(clinicId: string, conversationId: string) {
  const { rows } = await query(
    `select id, conversation_id, direction, sender_type, content, message_type, delivery_status,
            external_message_id, created_at
     from public.messages
     where clinic_id = $1 and conversation_id = $2
     order by created_at asc
     limit 200`,
    [clinicId, conversationId],
  )
  return rows
}

export async function setConversationAi(clinicId: string, conversationId: string, enabled: boolean) {
  const { rowCount } = await query(
    `update public.whatsapp_conversations set ai_assistance_enabled = $3, updated_at = now()
     where id = $1 and clinic_id = $2`,
    [conversationId, clinicId, enabled],
  )
  return (rowCount ?? 0) > 0
}

export async function getConversationById(clinicId: string, id: string) {
  const { rows } = await query(
    `select c.*, cl.name as contact_name, cl.phone, cl.wa_id
     from public.whatsapp_conversations c
     join public.clients cl on cl.id = c.client_id
     where c.clinic_id = $1 and c.id = $2`,
    [clinicId, id],
  )
  return rows[0] ?? null
}
