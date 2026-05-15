import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getApiAuth } from '../../server/auth/apiAuth.ts'
import { getOrCreateInstanceRecord, updateInstance } from '../../server/evolution/instanceRepository.ts'
import { connectInstance, extractQrFromConnect } from '../../server/evolution/evolutionService.ts'

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

  const record = await getOrCreateInstanceRecord(auth.clinicId)
  const connectRes = await connectInstance(record.instance_name)
  const qr = connectRes.ok ? extractQrFromConnect(connectRes.data) : record.qr_code

  if (qr) {
    await updateInstance(record.id, { status: 'qrcode', qr_code: qr })
  }

  res.status(200).json({ qrCode: qr, status: qr ? 'qrcode' : record.status })
}
