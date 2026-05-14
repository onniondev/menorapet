import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'
import { assertPetviaAdmin, getUserFromRequest, serviceClient } from '../_shared/supabase.ts'
import { fetchMediaInsights } from '../_shared/instagram.ts'

type Body = { post_id: string }

async function resolveIgCredentials(sb: ReturnType<typeof serviceClient>) {
  const envTok = Deno.env.get('INSTAGRAM_ACCESS_TOKEN')
  const envUser = Deno.env.get('INSTAGRAM_USER_ID')
  if (envTok && envUser) return { igUserId: envUser, accessToken: envTok }
  const { data: acc } = await sb
    .from('instagram_accounts')
    .select('id, instagram_user_id')
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (!acc) return null
  const { data: row } = await sb.from('instagram_account_access_tokens').select('access_token').eq('account_id', acc.id).maybeSingle()
  if (!row?.access_token) return null
  return { igUserId: acc.instagram_user_id, accessToken: row.access_token }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'method_not_allowed' }, 405)

  const { user, error: authErr } = await getUserFromRequest(req)
  if (!user) return jsonResponse({ error: authErr ?? 'unauthorized' }, 401)

  const admin = await assertPetviaAdmin(user.id)
  if (!admin.ok) return jsonResponse({ error: 'forbidden' }, 403)

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400)
  }
  if (!body.post_id) return jsonResponse({ error: 'missing_post_id' }, 400)

  const sb = serviceClient()
  const { data: post, error: pErr } = await sb.from('marketing_posts').select('id, instagram_media_id, status').eq('id', body.post_id).single()
  if (pErr || !post) return jsonResponse({ error: 'post_not_found' }, 404)
  if (post.status !== 'published' || !post.instagram_media_id) {
    return jsonResponse({ error: 'not_published', message: 'Métricas só para posts publicados com media id.' }, 422)
  }

  const creds = await resolveIgCredentials(sb)
  if (!creds) return jsonResponse({ error: 'instagram_not_configured' }, 503)

  const ins = await fetchMediaInsights(creds, post.instagram_media_id as string)
  if (!ins.ok) return jsonResponse({ error: 'insights_failed', detail: ins.error }, 502)

  const { error: mErr } = await sb.from('marketing_post_metrics').insert({
    post_id: post.id,
    likes_count: ins.metrics.likes_count,
    comments_count: ins.metrics.comments_count,
    reach: ins.metrics.reach,
    impressions: ins.metrics.impressions,
    saves: ins.metrics.saves,
    shares: ins.metrics.shares,
  })
  if (mErr) return jsonResponse({ error: 'db_insert', detail: mErr.message }, 500)

  return jsonResponse({ ok: true })
})
