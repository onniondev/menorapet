import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getApiAuth } from '../../server/auth/apiAuth.ts'
import { listConversations } from '../../server/whatsapp/repositories.ts'

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

  const status = typeof req.query.status === 'string' ? req.query.status : undefined
  const queue = typeof req.query.queue === 'string' ? req.query.queue : undefined
  const unassigned = req.query.unassigned === '1' || req.query.unassigned === 'true'
  const search = typeof req.query.q === 'string' ? req.query.q : undefined
  const rows = await listConversations(auth.clinicId, { status, queue, unassigned: unassigned || undefined, search })
  res.status(200).json({ conversations: rows })
}
