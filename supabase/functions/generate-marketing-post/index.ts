import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'
import { assertPetviaAdmin, getUserFromRequest, serviceClient } from '../_shared/supabase.ts'

const SYSTEM_PROMPT = `Você é o Social Media estratégico do PetVia, um SaaS de IA para clínicas veterinárias. Seu objetivo é criar posts que gerem leads qualificados de donos e gestores de clínicas veterinárias. Escreva de forma clara, moderna, objetiva e com foco em dor, benefício e conversão. Não prometa resultados irreais. Não use informações médicas falsas. Sempre inclua CTA.

Responda APENAS com um JSON válido no schema:
{
  "title": string,
  "caption": string (com emojis moderados se fizer sentido),
  "cta": string,
  "hashtags": string[] (sem # no texto, 5 a 12 itens),
  "visual_prompt": string (ideia de imagem / arte),
  "visual_script": string (roteiro visual ou slides; para reels/story descreva cenas curtas),
  "variants": [
    { "variant_name": "A", "title": string, "caption": string, "cta": string, "hashtags": string[], "score": number },
    { "variant_name": "B", "title": string, "caption": string, "cta": string, "hashtags": string[], "score": number }
  ]
}`

type Body = {
  objective: string
  format: string
  tone: string
  target_audience?: string
  extra_context?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'method_not_allowed' }, 405)

  const { user, error: authErr } = await getUserFromRequest(req)
  if (!user) return jsonResponse({ error: authErr ?? 'unauthorized' }, 401)

  const admin = await assertPetviaAdmin(user.id)
  if (!admin.ok) return jsonResponse({ error: 'forbidden', detail: admin.reason }, 403)

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400)
  }

  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) return jsonResponse({ error: 'openai_not_configured' }, 503)

  const userContent = [
    `Objetivo: ${body.objective}`,
    `Formato: ${body.format}`,
    `Tom: ${body.tone}`,
    body.target_audience ? `Público-alvo: ${body.target_audience}` : '',
    body.extra_context ? `Contexto extra: ${body.extra_context}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const oaRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini',
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
    }),
  })

  const oaJson = await oaRes.json().catch(() => ({}))
  if (!oaRes.ok) {
    return jsonResponse({ error: 'openai_error', detail: oaJson }, 502)
  }

  const raw = (oaJson as { choices?: { message?: { content?: string } }[] }).choices?.[0]?.message?.content
  if (!raw) return jsonResponse({ error: 'openai_empty' }, 502)

  let parsed: {
    title: string
    caption: string
    cta: string
    hashtags: string[]
    visual_prompt: string
    visual_script: string
    variants: { variant_name: string; title: string; caption: string; cta: string; hashtags: string[]; score?: number }[]
  }
  try {
    parsed = JSON.parse(raw)
  } catch {
    return jsonResponse({ error: 'openai_invalid_json', raw }, 502)
  }

  const sb = serviceClient()
  const { data: post, error: insErr } = await sb
    .from('marketing_posts')
    .insert({
      title: parsed.title ?? '',
      caption: parsed.caption ?? '',
      cta: parsed.cta ?? '',
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
      format: body.format,
      objective: body.objective,
      tone: body.tone,
      target_audience: body.target_audience ?? null,
      extra_context: body.extra_context ?? null,
      visual_prompt: parsed.visual_prompt ?? '',
      visual_script: parsed.visual_script ?? '',
      status: 'draft',
      created_by: user.id,
    })
    .select('id')
    .single()

  if (insErr || !post) return jsonResponse({ error: 'db_insert', detail: insErr?.message }, 500)

  const variants = Array.isArray(parsed.variants) ? parsed.variants : []
  if (variants.length) {
    const rows = variants.map((v) => ({
      post_id: post.id,
      variant_name: v.variant_name ?? 'variant',
      title: v.title ?? '',
      caption: v.caption ?? '',
      cta: v.cta ?? '',
      hashtags: Array.isArray(v.hashtags) ? v.hashtags : [],
      score: typeof v.score === 'number' ? v.score : null,
    }))
    const { error: vErr } = await sb.from('marketing_post_variants').insert(rows)
    if (vErr) return jsonResponse({ error: 'variants_insert', detail: vErr.message, post_id: post.id }, 500)
  }

  return jsonResponse({ post_id: post.id })
})
