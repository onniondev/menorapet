import { createClient } from '@supabase/supabase-js'

export type ApiAuthContext = {
  userId: string
  clinicId: string
}

function readHeader(req: Request | { headers: Record<string, string | string[] | undefined> }, name: string): string | undefined {
  if ('headers' in req && typeof req.headers.get === 'function') {
    return req.headers.get(name) ?? undefined
  }
  const h = (req as { headers: Record<string, string | string[] | undefined> }).headers
  const v = h[name] ?? h[name.toLowerCase()]
  return Array.isArray(v) ? v[0] : v
}

export async function getApiAuth(
  req: Request | { headers: Record<string, string | string[] | undefined> },
): Promise<ApiAuthContext | { error: string; status: number }> {
  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
  const anon = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY
  if (!url || !anon) return { error: 'Supabase não configurado no servidor', status: 500 }

  const auth = readHeader(req, 'authorization')
  if (!auth?.startsWith('Bearer ')) return { error: 'Não autorizado', status: 401 }
  const token = auth.slice(7)

  const clinicId = readHeader(req, 'x-clinic-id')
  if (!clinicId) return { error: 'Header x-clinic-id obrigatório', status: 400 }

  const sb = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: userData, error: userErr } = await sb.auth.getUser()
  if (userErr || !userData.user) return { error: 'Token inválido', status: 401 }

  const { data: member, error: memErr } = await sb
    .from('clinic_members')
    .select('id')
    .eq('clinic_id', clinicId)
    .eq('user_id', userData.user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (memErr || !member) return { error: 'Sem acesso a esta clínica', status: 403 }

  return { userId: userData.user.id, clinicId }
}
