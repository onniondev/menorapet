import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleConversationRoutes } from '../_bundle/handlers.cjs'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = req.query.segments
  const segments = Array.isArray(raw) ? raw : raw ? [raw] : []
  try {
    await handleConversationRoutes(req, res, segments)
  } catch (e) {
    console.error('conversations api', segments, e)
    res.status(500).json({ error: (e as Error).message })
  }
}
