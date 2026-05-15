import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getApiAuth } from '../../server/auth/apiAuth.ts'
import { getOrCreateInstanceRecord } from '../../server/evolution/instanceRepository.ts'
import { deleteInstance } from '../../server/evolution/evolutionService.ts'
import { query } from '../../server/db/pool.ts'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const auth = await getApiAuth(req)
  if ('error' in auth) {
    res.status(auth.status).json({ error: auth.error })
    return
  }

  const record = await getOrCreateInstanceRecord(auth.clinicId)
  await deleteInstance(record.instance_name).catch(() => {})
  await query(`delete from public.whatsapp_instances where id = $1`, [record.id])
  res.status(200).json({ ok: true })
}
