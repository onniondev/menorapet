import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleAppApi } from '../server/api/handlers'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = req.query.route
  const segments = Array.isArray(raw) ? raw : raw ? [raw] : []
  return handleAppApi(req, res, segments)
}
