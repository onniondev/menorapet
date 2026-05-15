import type { VercelRequest, VercelResponse } from '@vercel/node'
import { extractInboundMessages, type MetaWebhookPayload } from '../../server/whatsapp/parseWebhook.ts'
import { processInboundWhatsAppMessage } from '../../server/whatsapp/inboundProcessor.ts'
import { logWebhook } from '../../server/whatsapp/repositories.ts'
import { verifyMetaSignature } from '../../server/utils/metaSignature.ts'

export const config = {
  api: { bodyParser: false },
}

function readRawBody(req: VercelRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
