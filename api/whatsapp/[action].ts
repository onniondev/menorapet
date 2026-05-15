import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleWhatsAppRoutes } from '../_bundle/handlers.cjs'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action as string
  if (!action) {
    res.status(404).json({ error: 'Ação não informada' })
    return
  }
  try {
    await handleWhatsAppRoutes(req, res, [action])
  } catch (e) {
    console.error('whatsapp api', action, e)
    res.status(500).json({ error: (e as Error).message })
  }
}
