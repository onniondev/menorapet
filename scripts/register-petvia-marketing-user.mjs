/**
 * Registra usuário de teste no Supabase Auth e (opcional) promove a petvia_admins.
 *
 * Uso (PowerShell):
 *   $env:REG_EMAIL = "adminmkt@site.com"
 *   $env:REG_PASSWORD = "sua_senha"
 *   node scripts/register-petvia-marketing-user.mjs
 *
 * Requer em .env.local: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
 * Opcional em .env.local ou env: DATABASE_URL — para INSERT em petvia_admins
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import { createClient } from '@supabase/supabase-js'
import pg from 'pg'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(root, '.env.local'), 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const i = t.indexOf('=')
      if (i === -1) continue
      const k = t.slice(0, i).trim()
      let v = t.slice(i + 1).trim()
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
      if (!process.env[k]) process.env[k] = v
    }
  } catch {
    console.error('Não foi possível ler .env.local na raiz do projeto.')
    process.exit(1)
  }
}

loadEnvLocal()

const url = process.env.VITE_SUPABASE_URL
const anon = process.env.VITE_SUPABASE_ANON_KEY
const email = process.env.REG_EMAIL
const password = process.env.REG_PASSWORD

if (!url || !anon) {
  console.error('Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em .env.local')
  process.exit(1)
}
if (!email || !password) {
  console.error('Defina REG_EMAIL e REG_PASSWORD no ambiente (não commitar a senha).')
  process.exit(1)
}

const sb = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } })

const { data, error } = await sb.auth.signUp({
  email: email.trim(),
  password,
  options: { data: { full_name: 'Admin Marketing' } },
})

if (error) {
  if (error.message.toLowerCase().includes('already') || error.code === 'user_already_exists') {
    console.log('Usuário já existe no Auth. Tentando apenas promover a petvia_admins (se DATABASE_URL estiver definido)…')
  } else {
    console.error('signUp:', error.message)
    process.exit(1)
  }
} else {
  console.log('Cadastro Auth:', data.user ? `ok (user id ${data.user.id})` : 'ok')
  if (data.session) console.log('Sessão retornada (confirmação de e-mail pode estar desligada).')
  else console.log('Sem sessão imediata — verifique confirmação de e-mail no Supabase Auth settings.')
}

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  console.log('\nSem DATABASE_URL: rode no SQL Editor o arquivo supabase/seeds/petvia_admin_adminmkt.sql (ou defina DATABASE_URL e execute este script de novo).')
  process.exit(0)
}

const sql = `
insert into public.petvia_admins (user_id, role)
select id, 'admin'
from auth.users
where lower(trim(email)) = lower(trim($1))
on conflict (user_id) do update set role = excluded.role;
`

const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
try {
  await client.connect()
  const r = await client.query(sql, [email.trim()])
  console.log('petvia_admins:', r.rowCount != null ? `linhas afetadas: ${r.rowCount}` : 'ok')
} catch (e) {
  console.error('Postgres:', e.message)
  process.exit(1)
} finally {
  await client.end().catch(() => {})
}

console.log('Pronto. Faça login em /login com o e-mail e senha informados.')
