import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getApiAuth } from '../../server/auth/apiAuth.ts'
import { connectClinicWhatsApp } from '../../server/evolution/instanceRepository.ts'

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

  const body = (req.body ?? {}) as { displayName?: string }
  try {
    const result = await connectClinicWhatsApp(auth.clinicId, body.displayName)
    res.status(200).json({
      ok: true,
      status: result.status,
      qrCode: result.qrCode,
      instanceName: result.instance.instance_name,
    })
  } catch (e) {
    res.status(502).json({ error: (e as Error).message })
  }
}
