const GRAPH_VERSION = Deno.env.get('INSTAGRAM_GRAPH_VERSION') ?? 'v21.0'
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`

export type IgCredentials = { igUserId: string; accessToken: string }

/** Cria container de imagem única e publica. Requer image_url público HTTPS. */
export async function publishSingleImagePost(creds: IgCredentials, caption: string, imageUrl: string) {
  if (!/^https:\/\//i.test(imageUrl)) {
    return { ok: false as const, error: 'image_url deve ser HTTPS público acessível pelo Instagram' }
  }

  const qs = new URLSearchParams({
    image_url: imageUrl,
    caption,
    access_token: creds.accessToken,
  })

  const createRes = await fetch(`${GRAPH_BASE}/${creds.igUserId}/media?${qs}`, { method: 'POST' })
  const createJson = await createRes.json().catch(() => ({}))
  if (!createRes.ok) {
    return { ok: false as const, error: `create_media: ${JSON.stringify(createJson)}` }
  }
  const creationId = createJson.id as string | undefined
  if (!creationId) return { ok: false as const, error: 'create_media_sem_id' }

  // Aguarda processamento do container
  const deadline = Date.now() + 120_000
  let status = 'IN_PROGRESS'
  while (status === 'IN_PROGRESS' && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 1500))
    const st = await fetch(
      `${GRAPH_BASE}/${creationId}?fields=status_code&access_token=${encodeURIComponent(creds.accessToken)}`,
    )
    const stJson = await st.json().catch(() => ({}))
    status = (stJson.status_code as string) ?? (stJson.status as string) ?? 'UNKNOWN'
    if (status === 'FINISHED' || status === 'PUBLISHED') break
    if (status === 'ERROR') return { ok: false as const, error: `container_error: ${JSON.stringify(stJson)}` }
  }

  const pubQs = new URLSearchParams({
    creation_id: creationId,
    access_token: creds.accessToken,
  })
  const pubRes = await fetch(`${GRAPH_BASE}/${creds.igUserId}/media_publish?${pubQs}`, { method: 'POST' })
  const pubJson = await pubRes.json().catch(() => ({}))
  if (!pubRes.ok) {
    return { ok: false as const, error: `media_publish: ${JSON.stringify(pubJson)}` }
  }
  const mediaId = pubJson.id as string | undefined
  if (!mediaId) return { ok: false as const, error: 'publish_sem_media_id' }

  const permRes = await fetch(
    `${GRAPH_BASE}/${mediaId}?fields=permalink,media_type&access_token=${encodeURIComponent(creds.accessToken)}`,
  )
  const permJson = await permRes.json().catch(() => ({}))
  const permalink = (permJson.permalink as string) ?? ''

  return { ok: true as const, instagram_media_id: mediaId, instagram_permalink: permalink }
}

export async function fetchMediaInsights(creds: IgCredentials, mediaId: string) {
  const fields = 'like_count,comments_count,media_type'
  const mediaUrl = `${GRAPH_BASE}/${mediaId}?fields=${fields}&access_token=${encodeURIComponent(creds.accessToken)}`
  const mRes = await fetch(mediaUrl)
  const mJson = await mRes.json().catch(() => ({}))
  const out = {
    likes_count: 0,
    comments_count: 0,
    reach: 0,
    impressions: 0,
    saves: 0,
    shares: 0,
  }
  if (mRes.ok) {
    out.likes_count = Number((mJson as { like_count?: number }).like_count ?? 0)
    out.comments_count = Number((mJson as { comments_count?: number }).comments_count ?? 0)
  }

  const metrics = ['reach', 'saved', 'impressions', 'shares'].join(',')
  const insUrl = `${GRAPH_BASE}/${mediaId}/insights?metric=${encodeURIComponent(metrics)}&access_token=${encodeURIComponent(creds.accessToken)}`
  const res = await fetch(insUrl)
  const json = await res.json().catch(() => ({}))
  if (res.ok) {
    const data = (json.data as { name: string; values: { value: number }[] }[]) ?? []
    for (const row of data) {
      const v = row.values?.[0]?.value ?? 0
      if (row.name === 'reach') out.reach = v
      if (row.name === 'impressions') out.impressions = v
      if (row.name === 'saved') out.saves = v
      if (row.name === 'shares') out.shares = v
    }
  }

  if (!mRes.ok) return { ok: false as const, error: JSON.stringify(mJson) }
  return { ok: true as const, metrics: out }
}
