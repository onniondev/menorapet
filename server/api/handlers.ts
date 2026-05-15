import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getApiAuth } from '../auth/apiAuth'
import { connectClinicWhatsApp, getOrCreateInstanceRecord, syncClinicWhatsAppStatus, updateInstance } from '../evolution/instanceRepository'
import { connectInstance, deleteInstance, extractQrFromConnect, logoutInstance, mapEvolutionState } from '../evolution/evolutionService'
import {
  extractConnectionState,
  extractEvolutionInboundMessages,
  extractQrFromWebhook,
  isConnectionEvent,
  isQrCodeEvent,
  type EvolutionWebhookEnvelope,
} from '../evolution/parseEvolutionWebhook'
import { extractInboundMessages, type MetaWebhookPayload } from '../whatsapp/parseWebhook'
import { processInboundWhatsAppMessage } from '../whatsapp/inboundProcessor'
import { processEvolutionInboundMessage } from '../whatsapp/processEvolutionInbound'
import { assignConversation, closeConversation, sendAgentMessage, transferConversation } from '../whatsapp/conversationActions'
import {
  getConversationById,
  getConversationHistory,
  listConversations,
  logWebhook,
  setConversationAi,
} from '../whatsapp/repositories'
import { getInstanceByName } from '../whatsapp/providers/getProviderForClinic'
import { verifyMetaSignature } from '../utils/metaSignature'
import { query } from '../db/pool'
import type { ConversationQueue } from '../types/whatsapp'

function readRawBody(req: VercelRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function evolutionSecretOk(req: VercelRequest): boolean {
  const expected = process.env.EVOLUTION_WEBHOOK_SECRET
  if (!expected) return true
  const header = (req.headers['x-evolution-secret'] ?? req.headers['apikey']) as string | undefined
  const query = req.query.secret as string | undefined
  return header === expected || query === expected
}

export async function handleEvolutionWebhook(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  if (!evolutionSecretOk(req)) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  try {
    const body = (req.body ?? {}) as EvolutionWebhookEnvelope
    const instanceName = body.instance ?? body.instanceName ?? ''

    if (isQrCodeEvent(body) && instanceName) {
      const qr = extractQrFromWebhook(body)
      const inst = await getInstanceByName(instanceName)
      if (inst && qr) await updateInstance(inst.id, { status: 'qrcode', qr_code: qr })
      res.status(200).json({ ok: true, event: 'qrcode' })
      return
    }

    if (isConnectionEvent(body) && instanceName) {
      const state = mapEvolutionState(extractConnectionState(body))
      const inst = await getInstanceByName(instanceName)
      if (inst) {
        await updateInstance(inst.id, {
          status: state,
          qr_code: state === 'connected' ? null : undefined,
          last_connected_at: state === 'connected' ? new Date() : undefined,
          last_disconnected_at: state === 'disconnected' ? new Date() : undefined,
        })
      }
      res.status(200).json({ ok: true, event: 'connection' })
      return
    }

    const messages = extractEvolutionInboundMessages(body)
    await logWebhook(null, 'evolution_webhook', { event: body.event, count: messages.length, instanceName })

    for (const msg of messages) {
      try {
        await processEvolutionInboundMessage({ ...msg, instanceName: msg.instanceName || instanceName })
      } catch (e) {
        await logWebhook(null, 'evolution_process_error', { msg }, String(e))
      }
    }

    res.status(200).json({ ok: true, processed: messages.length })
  } catch (e) {
    console.error('evolution webhook', e)
    res.status(500).json({ error: 'Internal error' })
  }
}

export async function handleMetaWebhook(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']
    const verify = process.env.META_VERIFY_TOKEN
    if (mode === 'subscribe' && token === verify && typeof challenge === 'string') {
      res.status(200).send(challenge)
      return
    }
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const raw = await readRawBody(req)
    const appSecret = process.env.META_APP_SECRET ?? ''
    const sig = req.headers['x-hub-signature-256'] as string | undefined
    if (appSecret && sig && !verifyMetaSignature(raw, sig, appSecret)) {
      res.status(401).json({ error: 'Invalid signature' })
      return
    }

    const payload = JSON.parse(raw) as MetaWebhookPayload
    const messages = extractInboundMessages(payload)
    await logWebhook(null, 'webhook_received', { count: messages.length, object: payload.object })

    for (const msg of messages) {
      try {
        await processInboundWhatsAppMessage(msg)
      } catch (e) {
        await logWebhook(null, 'process_error', { msg }, String(e))
      }
    }

    res.status(200).json({ ok: true, processed: messages.length })
  } catch (e) {
    console.error('whatsapp webhook', e)
    res.status(500).json({ error: 'Internal error' })
  }
}

export async function handleAppApi(req: VercelRequest, res: VercelResponse, segments: string[]) {
  const [area, ...rest] = segments

  if (area === 'whatsapp') {
    return handleWhatsAppRoutes(req, res, rest)
  }
  if (area === 'conversations') {
    return handleConversationRoutes(req, res, rest)
  }

  res.status(404).json({ error: 'Not found' })
}

export async function handleWhatsAppRoutes(req: VercelRequest, res: VercelResponse, rest: string[]) {
  const action = rest[0]
  const auth = await getApiAuth(req)
  if ('error' in auth) {
    res.status(auth.status).json({ error: auth.error })
    return
  }

  if (action === 'connect' && req.method === 'POST') {
    const body = (req.body ?? {}) as { displayName?: string }
    try {
      const result = await connectClinicWhatsApp(auth.clinicId, body.displayName)
      res.status(200).json({
        ok: true,
        status: result.status,
        qrCode: result.qrCode,
        instanceName: result.instance.instance_name,
      })
    } catch (e) {
      res.status(502).json({ error: (e as Error).message })
    }
    return
  }

  if (action === 'status' && req.method === 'GET') {
    try {
      const result = await syncClinicWhatsAppStatus(auth.clinicId)
      res.status(200).json({
        status: result.status,
        instance: result.instance,
        phoneNumber: result.instance?.phone_number ?? null,
        qrCode: result.instance?.qr_code ?? null,
        evolutionReachable: result.evolutionReachable,
        evolutionError: result.evolutionError ?? null,
      })
    } catch (e) {
      const msg = (e as Error).message
      console.error('whatsapp status', msg)
      if (/relation .* does not exist/i.test(msg)) {
        res.status(503).json({
          error: 'Tabela whatsapp_instances não existe. Rode as migrações SQL no Supabase (whatsapp_meta e whatsapp_evolution).',
        })
        return
      }
      if (/DATABASE_URL/i.test(msg) || /password authentication/i.test(msg) || /ENOTFOUND|ECONNREFUSED/i.test(msg)) {
        res.status(503).json({
          error: 'Falha ao conectar no Postgres. Confira DATABASE_URL na Vercel (use a URI do Supabase com senha URL-encoded e ?sslmode=require).',
        })
        return
      }
      res.status(500).json({ error: msg })
    }
    return
  }

  if (action === 'qrcode' && req.method === 'GET') {
    const record = await getOrCreateInstanceRecord(auth.clinicId)
    const connectRes = await connectInstance(record.instance_name)
    const qr = connectRes.ok ? extractQrFromConnect(connectRes.data) : record.qr_code
    if (qr) await updateInstance(record.id, { status: 'qrcode', qr_code: qr })
    res.status(200).json({ qrCode: qr, status: qr ? 'qrcode' : record.status })
    return
  }

  if (action === 'logout' && req.method === 'POST') {
    const record = await getOrCreateInstanceRecord(auth.clinicId)
    await logoutInstance(record.instance_name)
    await updateInstance(record.id, { status: 'disconnected', qr_code: null, last_disconnected_at: new Date() })
    res.status(200).json({ ok: true, status: 'disconnected' })
    return
  }

  if (action === 'instance' && req.method === 'DELETE') {
    const record = await getOrCreateInstanceRecord(auth.clinicId)
    await deleteInstance(record.instance_name).catch(() => {})
    await query(`delete from public.whatsapp_instances where id = $1`, [record.id])
    res.status(200).json({ ok: true })
    return
  }

  res.status(404).json({ error: 'Not found' })
}

export async function handleConversationRoutes(req: VercelRequest, res: VercelResponse, rest: string[]) {
  if (rest.length === 0 && req.method === 'GET') {
    const auth = await getApiAuth(req)
    if ('error' in auth) {
      res.status(auth.status).json({ error: auth.error })
      return
    }
    const status = typeof req.query.status === 'string' ? req.query.status : undefined
    const queue = typeof req.query.queue === 'string' ? req.query.queue : undefined
    const unassigned = req.query.unassigned === '1' || req.query.unassigned === 'true'
    const search = typeof req.query.q === 'string' ? req.query.q : undefined
    const rows = await listConversations(auth.clinicId, { status, queue, unassigned: unassigned || undefined, search })
    res.status(200).json({ conversations: rows })
    return
  }

  const [id, sub] = rest
  if (!id) {
    res.status(404).json({ error: 'Not found' })
    return
  }

  const auth = await getApiAuth(req)
  if ('error' in auth) {
    res.status(auth.status).json({ error: auth.error })
    return
  }

  if (!sub && req.method === 'GET') {
    const conversation = await getConversationById(auth.clinicId, id)
    if (!conversation) {
      res.status(404).json({ error: 'Conversa não encontrada' })
      return
    }
    const messages = await getConversationHistory(id, 100)
    res.status(200).json({ conversation, messages })
    return
  }

  if (sub === 'messages' && req.method === 'POST') {
    const body = (req.body ?? {}) as { text?: string }
    const text = body.text?.trim()
    if (!text) {
      res.status(400).json({ error: 'text obrigatório' })
      return
    }
    try {
      const result = await sendAgentMessage(id, auth.clinicId, text)
      res.status(200).json({ ok: true, ...result })
    } catch (e) {
      res.status(502).json({ error: (e as Error).message })
    }
    return
  }

  if (sub === 'assign' && req.method === 'POST') {
    const ok = await assignConversation(id, auth.clinicId, auth.userId)
    if (!ok) res.status(404).json({ error: 'Conversa não encontrada' })
    else res.status(200).json({ ok: true })
    return
  }

  if (sub === 'close' && req.method === 'POST') {
    const ok = await closeConversation(id, auth.clinicId)
    if (!ok) res.status(404).json({ error: 'Conversa não encontrada' })
    else res.status(200).json({ ok: true })
    return
  }

  if (sub === 'transfer' && req.method === 'POST') {
    const body = (req.body ?? {}) as { queue?: ConversationQueue; assignedToId?: string | null }
    if (!body.queue) {
      res.status(400).json({ error: 'queue obrigatório' })
      return
    }
    const ok = await transferConversation(id, auth.clinicId, body.queue, body.assignedToId)
    if (!ok) res.status(404).json({ error: 'Conversa não encontrada' })
    else res.status(200).json({ ok: true })
    return
  }

  if (sub === 'ai' && req.method === 'POST') {
    const body = (req.body ?? {}) as { enabled?: boolean }
    if (typeof body.enabled !== 'boolean') {
      res.status(400).json({ error: 'enabled (boolean) obrigatório' })
      return
    }
    const ok = await setConversationAi(auth.clinicId, id, body.enabled)
    if (!ok) res.status(404).json({ error: 'Conversa não encontrada' })
    else res.status(200).json({ ok: true, aiEnabled: body.enabled })
    return
  }

  res.status(404).json({ error: 'Not found' })
}
