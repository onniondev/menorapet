/**
 * Aplica migrações WhatsApp (meta + evolution) na ordem correta.
 * Uso: DATABASE_URL="postgresql://postgres.REF:senha@...pooler...:5432/postgres" npm run db:migrate-whatsapp-all
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import pg from 'pg'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Defina DATABASE_URL (Session pooler Supabase, senha URL-encoded).')
  process.exit(1)
}

const files = [
  'supabase/migrations/20260315120000_whatsapp_meta.sql',
  'supabase/migrations/20260320120000_whatsapp_evolution.sql',
]

function parseUrl(raw) {
  const parsed = new URL(raw.trim().replace(/^postgresql:\/\//, 'postgres://'))
  const params = new URLSearchParams(parsed.search)
  params.delete('sslmode')
  params.delete('ssl')
  parsed.search = params.toString() ? `?${params.toString()}` : ''
  const connectionString = parsed.toString().replace(/^postgres:\/\//, 'postgresql://')
  const host = parsed.hostname
  const useSupabaseSsl =
    /\.supabase\.co$/i.test(host) || /\.pooler\.supabase\.com$/i.test(host)
  return { connectionString, useSupabaseSsl }
}

const { connectionString, useSupabaseSsl } = parseUrl(url)
const client = new pg.Client({
  connectionString,
  ssl: useSupabaseSsl ? { rejectUnauthorized: false } : undefined,
})

try {
  await client.connect()
  for (const file of files) {
    const path = resolve(file)
    console.log('Aplicando', file, '...')
    await client.query(readFileSync(path, 'utf8'))
    console.log('OK:', file)
  }
  const check = await client.query(
    `select to_regclass('public.whatsapp_instances') as whatsapp_instances`,
  )
  console.log('Tabela whatsapp_instances:', check.rows[0]?.whatsapp_instances ?? 'AUSENTE')
  console.log('Migrações WhatsApp aplicadas com sucesso.')
} catch (e) {
  console.error(e)
  process.exit(1)
} finally {
  await client.end().catch(() => {})
}
