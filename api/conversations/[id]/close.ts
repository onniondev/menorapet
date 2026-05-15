import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getApiAuth } from '../../../server/auth/apiAuth.ts'
import { closeConversation } from '../../../server/whatsapp/conversationActions.ts'

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
  const ok = await closeConversation(id, auth.clinicId)
  if (!ok) {
    res.status(404).json({ error: 'Conversa não encontrada' })
    return
  }
  res.status(200).json({ ok: true })
}
