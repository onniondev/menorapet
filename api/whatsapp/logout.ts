import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getApiAuth } from '../../server/auth/apiAuth.ts'
import { getOrCreateInstanceRecord, updateInstance } from '../../server/evolution/instanceRepository.ts'
import { logoutInstance } from '../../server/evolution/evolutionService.ts'

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

  const record = await getOrCreateInstanceRecord(auth.clinicId)
  await logoutInstance(record.instance_name)
  await updateInstance(record.id, {
    status: 'disconnected',
    qr_code: null,
    last_disconnected_at: new Date(),
  })
  res.status(200).json({ ok: true, status: 'disconnected' })
}
