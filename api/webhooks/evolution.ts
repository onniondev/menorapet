import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  extractConnectionState,
  extractEvolutionInboundMessages,
  extractQrFromWebhook,
  isConnectionEvent,
  isQrCodeEvent,
  type EvolutionWebhookEnvelope,
} from '../../server/evolution/parseEvolutionWebhook.ts'
import { getInstanceByName } from '../../server/whatsapp/providers/getProviderForClinic.ts'
import { updateInstance } from '../../server/evolution/instanceRepository.ts'
import { mapEvolutionState } from '../../server/evolution/evolutionService.ts'
import { processEvolutionInboundMessage } from '../../server/whatsapp/processEvolutionInbound.ts'
import { logWebhook } from '../../server/whatsapp/repositories.ts'

function verifySecret(req: VercelRequest): boolean {
  const expected = process.env.EVOLUTION_WEBHOOK_SECRET
  if (!expected) return true
  const header = (req.headers['x-evolution-secret'] ?? req.headers['apikey']) as string | undefined
  const query = req.query.secret as string | undefined
  return header === expected || query === expected
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!verifySecret(req)) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  try {
    const body = (req.body ?? {}) as EvolutionWebhookEnvelope
    const instanceName = body.instance ?? body.instanceName ?? ''

    if (isQrCodeEvent(body) && instanceName) {
      const qr = extractQrFromWebhook(body)
      const inst = await getInstanceByName(instanceName)
      if (inst && qr) {
        await updateInstance(inst.id, { status: 'qrcode', qr_code: qr })
      }
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
