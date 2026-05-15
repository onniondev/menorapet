import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleEvolutionWebhook, handleMetaWebhook } from '../../server/api/handlers'

export const config = {
  api: { bodyParser: false },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const target = req.query.target as string

  if (target === 'evolution') {
    if (req.method === 'POST' && !req.body) {
      const chunks: Buffer[] = []
      await new Promise<void>((resolve, reject) => {
        req.on('data', (c: Buffer) => chunks.push(c))
        req.on('end', () => {
          try {
            req.body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
            resolve()
          } catch (e) {
            reject(e)
          }
        })
        req.on('error', reject)
      })
    }
    return handleEvolutionWebhook(req, res)
  }

  if (target === 'whatsapp') {
    return handleMetaWebhook(req, res)
  }

  res.status(404).json({ error: 'Not found' })
}
