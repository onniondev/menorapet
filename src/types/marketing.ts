export type MarketingObjective = 'leads' | 'educate' | 'benefits' | 'social_proof' | 'promotion' | 'before_after'

export type MarketingFormat = 'single' | 'carousel' | 'reels_script' | 'story'

export type MarketingPostStatus = 'draft' | 'approved' | 'scheduled' | 'published' | 'rejected'

export type MarketingTone = 'professional' | 'bold' | 'educational' | 'emotional' | 'fun'

export type MarketingPostRow = {
  id: string
  title: string
  caption: string
  cta: string
  hashtags: string[]
  format: MarketingFormat
  objective: MarketingObjective
  tone: string | null
  target_audience: string | null
  extra_context: string | null
  visual_prompt: string | null
  visual_script: string | null
  image_url: string | null
  status: MarketingPostStatus
  scheduled_at: string | null
  published_at: string | null
  instagram_media_id: string | null
  instagram_permalink: string | null
  leads_count: number
  created_by: string
  created_at: string
  updated_at: string
}

export type MarketingPostVariantRow = {
  id: string
  post_id: string
  variant_name: string
  title: string
  caption: string
  cta: string
  hashtags: string[]
  score: number | null
  created_at: string
}

export type MarketingPostMetricRow = {
  id: string
  post_id: string
  likes_count: number
  comments_count: number
  reach: number
  impressions: number
  saves: number
  shares: number
  collected_at: string
}

export type MarketingPostWithRelations = MarketingPostRow & {
  marketing_post_variants?: MarketingPostVariantRow[]
  marketing_post_metrics?: MarketingPostMetricRow[]
}

export type GenerateMarketingPostInput = {
  objective: MarketingObjective
  format: MarketingFormat
  tone: MarketingTone
  target_audience?: string
  extra_context?: string
}
