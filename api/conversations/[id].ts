import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getApiAuth } from '../../server/auth/apiAuth.ts'
import { getConversationById, getConversationHistory } from '../../server/whatsapp/repositories.ts'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const auth = await getApiAuth(req)
  if ('error' in auth) {
    res.status(auth.status).json({ error: auth.error })
    return
  }

  const id = req.query.id as string
  const conversation = await getConversationById(auth.clinicId, id)
  if (!conversation) {
    res.status(404).json({ error: 'Conversa não encontrada' })
    return
  }

  const messages = await getConversationHistory(id, 100)
  res.status(200).json({ conversation, messages })
}
