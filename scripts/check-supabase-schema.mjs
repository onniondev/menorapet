/**
 * Verifica se as tabelas da fundação existem via PostgREST (usa .env.local).
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnvLocal() {
  const p = resolve('.env.local')
  if (!existsSync(p)) {
    console.error('Arquivo .env.local não encontrado na raiz do projeto.')
    process.exit(1)
  }
  const out = {}
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
  return out
}

const env = loadEnvLocal()
const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_ANON_KEY
if (!url || !key) {
  console.error('Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em .env.local')
  process.exit(1)
}

const tables = ['profiles', 'clinics', 'clinic_members', 'invitations', 'audit_logs']
const headers = { apikey: key, Authorization: `Bearer ${key}` }

for (const t of tables) {
  const r = await fetch(`${url}/rest/v1/${t}?select=id&limit=1`, { headers })
  const ok = r.status === 200
  console.log(ok ? `✓ ${t}` : `✗ ${t} (HTTP ${r.status})`, ok ? '' : await r.text().then((x) => x.slice(0, 120)))
  if (!ok) process.exitCode = 1
}
