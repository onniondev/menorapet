import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'
import { assertPetviaAdmin, getUserFromRequest, serviceClient } from '../_shared/supabase.ts'
import { publishMarketingPostInternal } from '../_shared/publishMarketingPost.ts'

type Body = { post_id: string }

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
  const result = await publishMarketingPostInternal(sb, body.post_id, { allowEarlyScheduled: false })

  if (!result.ok) {
    return jsonResponse({ error: result.code, message: result.message }, result.http ?? 500)
  }

  return jsonResponse({
    ok: true,
    instagram_media_id: result.instagram_media_id,
    instagram_permalink: result.instagram_permalink,
  })
})
