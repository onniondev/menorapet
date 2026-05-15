declare module '*/_bundle/handlers.cjs' {
  import type { VercelRequest, VercelResponse } from '@vercel/node'

  export function handleWhatsAppRoutes(req: VercelRequest, res: VercelResponse, rest: string[]): Promise<void>
  export function handleConversationRoutes(req: VercelRequest, res: VercelResponse, rest: string[]): Promise<void>
  export function handleEvolutionWebhook(req: VercelRequest, res: VercelResponse): Promise<void>
  export function handleMetaWebhook(req: VercelRequest, res: VercelResponse): Promise<void>
}
