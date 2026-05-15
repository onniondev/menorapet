import { randomBytes } from 'node:crypto'

const secret = randomBytes(32).toString('base64url')
console.log('EVOLUTION_WEBHOOK_SECRET (cole na Vercel):')
console.log(secret)
