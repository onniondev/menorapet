import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getApiAuth } from '../../server/auth/apiAuth.ts'
import { syncClinicWhatsAppStatus } from '../../server/evolution/instanceRepository.ts'

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

  const result = await syncClinicWhatsAppStatus(auth.clinicId)
  res.status(200).json({
    status: result.status,
    instance: result.instance,
    phoneNumber: result.instance?.phone_number ?? null,
    qrCode: result.instance?.qr_code ?? null,
  })
}
