import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getApiAuth } from '../../../server/auth/apiAuth.ts'
import { setConversationAi } from '../../../server/whatsapp/repositories.ts'

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
  const body = (req.body ?? {}) as { enabled?: boolean }
  if (typeof body.enabled !== 'boolean') {
    res.status(400).json({ error: 'enabled (boolean) obrigatório' })
    return
  }

  const ok = await setConversationAi(auth.clinicId, id, body.enabled)
  if (!ok) {
    res.status(404).json({ error: 'Conversa não encontrada' })
    return
  }
  res.status(200).json({ ok: true, aiEnabled: body.enabled })
}
