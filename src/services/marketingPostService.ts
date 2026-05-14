import type { GenerateMarketingPostInput, MarketingPostRow, MarketingPostWithRelations } from '../types/marketing'
import { supabase } from '../lib/supabase'

const postSelect = `
  *,
  marketing_post_variants(*),
  marketing_post_metrics(*)
`

export async function fetchMarketingPosts(): Promise<MarketingPostWithRelations[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('marketing_posts')
    .select(postSelect)
    .order('created_at', { ascending: false })
    .limit(120)
  if (error) throw new Error(error.message)
  return (data ?? []) as MarketingPostWithRelations[]
}

export async function updateMarketingPost(id: string, patch: Partial<MarketingPostRow>) {
  if (!supabase) throw new Error('Supabase não configurado')
  const { error } = await supabase.from('marketing_posts').update(patch).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function invokeGenerateMarketingPost(body: GenerateMarketingPostInput) {
  if (!supabase) throw new Error('Supabase não configurado')
  const { data, error } = await supabase.functions.invoke('generate-marketing-post', { body })
  if (error) throw new Error(error.message)
  const d = data as { error?: string; detail?: string; post_id?: string }
  if (d?.error) throw new Error(d.detail ?? d.error)
  if (!d?.post_id) throw new Error('Resposta inválida da função generate-marketing-post')
  return d.post_id
}

export async function invokePublishInstagramPost(postId: string) {
  if (!supabase) throw new Error('Supabase não configurado')
  const { data, error } = await supabase.functions.invoke('publish-instagram-post', { body: { post_id: postId } })
  if (error) throw new Error(error.message)
  const d = data as { error?: string; message?: string; detail?: string }
  if (d?.error) throw new Error(d.message ?? d.detail ?? d.error)
}

export async function invokeCollectInstagramMetrics(postId: string) {
  if (!supabase) throw new Error('Supabase não configurado')
  const { data, error } = await supabase.functions.invoke('collect-instagram-metrics', { body: { post_id: postId } })
  if (error) throw new Error(error.message)
  const d = data as { error?: string; detail?: string }
  if (d?.error) throw new Error(d.detail ?? d.error)
}
