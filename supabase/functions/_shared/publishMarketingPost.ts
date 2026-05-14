import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'
import { publishSingleImagePost } from './instagram.ts'

export type PublishResult =
  | { ok: true; instagram_media_id: string; instagram_permalink: string }
  | { ok: false; code: string; message?: string; http?: number }

async function resolveIgCredentials(sb: SupabaseClient) {
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

/** Publicação automática (sem checagem de admin — chamar só após auth de serviço ou rota admin). */
export async function publishMarketingPostInternal(
  sb: SupabaseClient,
  postId: string,
  opts: { allowEarlyScheduled?: boolean },
): Promise<PublishResult> {
  const { data: post, error: pErr } = await sb.from('marketing_posts').select('*').eq('id', postId).single()
  if (pErr || !post) return { ok: false, code: 'post_not_found', http: 404 }

  if (post.status === 'draft' || post.status === 'rejected') {
    return { ok: false, code: 'invalid_status', message: 'Rascunhos e rejeitados não podem ser publicados.', http: 422 }
  }

  if (post.status !== 'approved' && post.status !== 'scheduled') {
    return { ok: false, code: 'invalid_status', message: `Status: ${post.status}`, http: 422 }
  }

  if (post.status === 'scheduled') {
    const when = post.scheduled_at ? new Date(post.scheduled_at as string) : null
    if (when && when.getTime() > Date.now() && !(opts.allowEarlyScheduled ?? false)) {
      return { ok: false, code: 'not_due', message: 'Agendamento ainda não venceu.', http: 422 }
    }
  }

  if (post.format !== 'single') {
    return {
      ok: false,
      code: 'unsupported_format',
      message: 'Apenas format=single com image_url HTTPS nesta versão.',
      http: 422,
    }
  }

  const imageUrl = post.image_url as string | null
  if (!imageUrl) {
    return { ok: false, code: 'missing_image_url', message: 'Defina image_url (HTTPS).', http: 422 }
  }

  const creds = await resolveIgCredentials(sb)
  if (!creds) {
    return { ok: false, code: 'instagram_not_configured', http: 503 }
  }

  const hashtags = (post.hashtags as string[]) ?? []
  const caption = [post.title, '', post.caption, '', post.cta, '', hashtags.map((h) => `#${String(h).replace(/^#/, '')}`).join(' ')]
    .filter(Boolean)
    .join('\n')

  const pub = await publishSingleImagePost(creds, caption, imageUrl)
  if (!pub.ok) return { ok: false, code: 'instagram_error', message: pub.error, http: 502 }

  const { error: uErr } = await sb
    .from('marketing_posts')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      instagram_media_id: pub.instagram_media_id,
      instagram_permalink: pub.instagram_permalink,
    })
    .eq('id', postId)

  if (uErr) return { ok: false, code: 'db_update', message: uErr.message, http: 500 }

  return { ok: true, instagram_media_id: pub.instagram_media_id, instagram_permalink: pub.instagram_permalink }
}
