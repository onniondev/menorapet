/**
 * Registra usuário de teste no Supabase Auth, confirma e-mail (opcional) e promove a petvia_admins (opcional).
 *
 * Uso (PowerShell):
 *   $env:REG_EMAIL = "adminmkt@site.com"
 *   $env:REG_PASSWORD = "sua_senha"
 *   node scripts/register-petvia-marketing-user.mjs
 *
 * Requer em .env.local: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
 * Opcional: SUPABASE_SERVICE_ROLE_KEY — confirma e-mail via Admin API (Settings → API → service_role)
 * Opcional: DATABASE_URL — INSERT em petvia_admins via Postgres
 *
 * Sem service_role nem DATABASE_URL: use supabase/seeds/confirm_email_and_petvia_admin_adminmkt.sql no SQL Editor.
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

const emailTrim = email.trim()

const sb = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } })

const { data, error } = await sb.auth.signUp({
  email: emailTrim,
  password,
  options: { data: { full_name: 'Admin Marketing' } },
})

let userId = !error && data?.user?.id ? data.user.id : null

if (error) {
  if (error.message.toLowerCase().includes('already') || error.code === 'user_already_exists') {
    console.log('Usuário já existe no Auth.')
  } else {
    console.error('signUp:', error.message)
    process.exit(1)
  }
} else {
  console.log('Cadastro Auth:', data.user ? `ok (user id ${data.user.id})` : 'ok')
  if (data.session) console.log('Sessão retornada.')
  else console.log('Sem sessão imediata — tentando confirmar e-mail com service_role se configurado…')
}

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (serviceKey) {
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  let uid = userId
  if (!uid) {
    const { data: lu, error: le } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (le) {
      console.error('listUsers:', le.message)
    } else {
      const found = lu.users.find((u) => u.email?.toLowerCase() === emailTrim.toLowerCase())
      uid = found?.id ?? null
    }
  }
  if (uid) {
    const { error: ue } = await admin.auth.admin.updateUserById(uid, { email_confirm: true })
    if (ue) console.error('confirm email (admin):', ue.message)
    else console.log('E-mail confirmado via Admin API.')
  } else {
    console.error('Não achei user id para confirmar e-mail.')
  }
} else {
  console.log(
    'Sem SUPABASE_SERVICE_ROLE_KEY em .env.local — confirme o e-mail no Dashboard Auth ou rode supabase/seeds/confirm_email_and_petvia_admin_adminmkt.sql',
  )
}

const dbUrl = process.env.DATABASE_URL
if (dbUrl) {
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
    const r = await client.query(sql, [emailTrim])
    console.log('petvia_admins:', r.rowCount != null ? `linhas afetadas: ${r.rowCount}` : 'ok')
  } catch (e) {
    console.error('Postgres:', e.message)
    process.exit(1)
  } finally {
    await client.end().catch(() => {})
  }
} else {
  console.log('Sem DATABASE_URL — use o SQL em supabase/seeds/confirm_email_and_petvia_admin_adminmkt.sql para petvia_admins + confirmação.')
}

console.log('Pronto. Faça login em /login com o e-mail e senha informados.')
