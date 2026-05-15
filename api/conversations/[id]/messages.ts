import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getApiAuth } from '../../../server/auth/apiAuth.ts'
import { sendAgentMessage } from '../../../server/whatsapp/conversationActions.ts'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const auth = await getApiAuth(req)
  if ('error' in auth) {
    res.status(auth.status).json({ error: auth.error })
    return
  }

  const id = req.query.id as string
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
}
