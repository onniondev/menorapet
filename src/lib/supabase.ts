import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function envString(v: unknown): string {
  if (typeof v !== 'string') return ''
  const t = v.trim()
  return t.length ? t : ''
}

const url = envString(import.meta.env.VITE_SUPABASE_URL)
const anon = envString(import.meta.env.VITE_SUPABASE_ANON_KEY)

/** URL + chave presentes e URL parece HTTP(S) (evita string vazia / placeholder). */
export const isSupabaseConfigured = Boolean(url && anon && /^https?:\/\//i.test(url))

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anon!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
