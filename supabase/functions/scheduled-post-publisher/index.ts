import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'
import { serviceClient } from '../_shared/supabase.ts'
import { publishMarketingPostInternal } from '../_shared/publishMarketingPost.ts'

function verifyServiceCaller(req: Request) {
  const auth = req.headers.get('Authorization')?.trim() ?? ''
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  if (!key) return false
  return auth === `Bearer ${key}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'method_not_allowed' }, 405)

  if (!verifyServiceCaller(req)) {
    return jsonResponse({ error: 'unauthorized', message: 'Use Authorization: Bearer SERVICE_ROLE_KEY' }, 401)
  }

  const sb = serviceClient()
  const nowIso = new Date().toISOString()
  const { data: posts, error } = await sb
    .from('marketing_posts')
    .select('id')
    .eq('status', 'scheduled')
    .lte('scheduled_at', nowIso)

  if (error) return jsonResponse({ error: 'db_query', detail: error.message }, 500)

  const results: { id: string; ok: boolean; error?: string }[] = []
  for (const p of posts ?? []) {
    const r = await publishMarketingPostInternal(sb, p.id as string, { allowEarlyScheduled: true })
    results.push({ id: p.id as string, ok: r.ok, error: r.ok ? undefined : r.message ?? r.code })
  }

  return jsonResponse({ processed: results.length, results })
})
