import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

export function serviceClient() {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausente')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function getUserFromRequest(req: Request) {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return { user: null as null | { id: string; email?: string }, error: 'missing_auth' as const }
  const jwt = auth.slice('Bearer '.length).trim()
  const sb = serviceClient()
  const { data, error } = await sb.auth.getUser(jwt)
  if (error || !data.user) return { user: null, error: 'invalid_token' as const }
  return { user: data.user, error: null as null }
}

export async function assertPetviaAdmin(userId: string) {
  const sb = serviceClient()
  const { data, error } = await sb.from('petvia_admins').select('user_id').eq('user_id', userId).maybeSingle()
  if (error) return { ok: false as const, reason: error.message }
  if (!data) return { ok: false as const, reason: 'not_admin' }
  return { ok: true as const }
}
