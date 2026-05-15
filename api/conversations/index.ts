import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleConversationRoutes } from '../_bundle/handlers.cjs'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await handleConversationRoutes(req, res, [])
  } catch (e) {
    console.error('conversations index', e)
    res.status(500).json({ error: (e as Error).message })
  }
}
