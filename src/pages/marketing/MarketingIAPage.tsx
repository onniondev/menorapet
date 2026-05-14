import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BarChart3,
  CalendarDays,
  ExternalLink,
  Image as ImageIcon,
  Megaphone,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { marketingMockPosts } from '../../data/marketingMock'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Textarea } from '../../components/ui/textarea'
import { useMarketingPosts } from '../../hooks/useMarketingPosts'
import { isSupabaseConfigured } from '../../lib/supabase'
import * as marketingPostService from '../../services/marketingPostService'
import type {
  MarketingFormat,
  MarketingObjective,
  MarketingPostStatus,
  MarketingPostWithRelations,
  MarketingTone,
} from '../../types/marketing'

const marketingDemoLocal = import.meta.env.VITE_MARKETING_IA_DEMO === '1' && !isSupabaseConfigured

const OBJECTIVES: { value: MarketingObjective; label: string }[] = [
  { value: 'leads', label: 'Gerar leads' },
  { value: 'educate', label: 'Educar clínicas' },
  { value: 'benefits', label: 'Mostrar benefícios' },
  { value: 'social_proof', label: 'Prova social' },
  { value: 'promotion', label: 'Promoção' },
  { value: 'before_after', label: 'Antes / depois' },
]

const FORMATS: { value: MarketingFormat; label: string }[] = [
  { value: 'single', label: 'Post único' },
  { value: 'carousel', label: 'Carrossel' },
  { value: 'reels_script', label: 'Roteiro Reels' },
  { value: 'story', label: 'Story' },
]

const TONES: { value: MarketingTone; label: string }[] = [
  { value: 'professional', label: 'Profissional' },
  { value: 'bold', label: 'Ousado' },
  { value: 'educational', label: 'Educativo' },
  { value: 'emotional', label: 'Emocional' },
  { value: 'fun', label: 'Divertido' },
]

function statusLabel(s: MarketingPostStatus) {
  switch (s) {
    case 'draft':
      return 'Rascunho'
    case 'approved':
      return 'Aprovado'
    case 'scheduled':
      return 'Agendado'
    case 'published':
      return 'Publicado'
    case 'rejected':
      return 'Rejeitado'
    default:
      return s
  }
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function daysInMonthGrid(d: Date) {
  const start = startOfMonth(d)
  const startWeekday = (start.getDay() + 6) % 7
  const cells: { date: Date; inMonth: boolean }[] = []
  const first = new Date(start)
  first.setDate(first.getDate() - startWeekday)
  for (let i = 0; i < 42; i++) {
    const cur = new Date(first)
    cur.setDate(first.getDate() + i)
    cells.push({ date: cur, inMonth: cur.getMonth() === d.getMonth() })
  }
  return cells
}

function ymd(dt: Date) {
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

export default function MarketingIAPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const postsQ = useMarketingPosts()
  const posts = postsQ.data ?? marketingMockPosts

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const [nObj, setNObj] = useState<MarketingObjective>('leads')
  const [nFmt, setNFmt] = useState<MarketingFormat>('single')
  const [nTone, setNTone] = useState<MarketingTone>('professional')
  const [nAudience, setNAudience] = useState('')
  const [nExtra, setNExtra] = useState('')

  const effectiveSelectedId = selectedId ?? posts[0]?.id ?? null
  const selected = useMemo(() => posts.find((p) => p.id === effectiveSelectedId) ?? null, [posts, effectiveSelectedId])

  const invalidate = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ['marketing-posts'] })
  }, [qc])

  const generateM = useMutation({
    mutationFn: async () => {
      if (marketingDemoLocal) throw new Error('Modo demo: configure Supabase para gerar com IA.')
      await marketingPostService.invokeGenerateMarketingPost({
        objective: nObj,
        format: nFmt,
        tone: nTone,
        target_audience: nAudience || undefined,
        extra_context: nExtra || undefined,
      })
    },
    onSuccess: () => {
      toast.success('Post gerado pela IA.')
      setModalOpen(false)
      invalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const stats = useMemo(() => {
    const drafts = posts.filter((p) => p.status === 'draft').length
    const scheduled = posts.filter((p) => p.status === 'scheduled').length
    const published = posts.filter((p) => p.status === 'published').length
    const leads = posts.filter((p) => p.status === 'published').reduce((a, p) => a + (p.leads_count ?? 0), 0)
    let best: MarketingPostWithRelations | null = null
    let bestScore = -1
    for (const p of posts) {
      if (p.status !== 'published') continue
      const m = (p.marketing_post_metrics ?? []).sort(
        (a, b) => new Date(b.collected_at).getTime() - new Date(a.collected_at).getTime(),
      )[0]
      const score = (m?.likes_count ?? 0) + (m?.reach ?? 0) / 100
      if (score > bestScore) {
        bestScore = score
        best = p
      }
    }
    return { drafts, scheduled, published, leads, best }
  }, [posts])

  const calendarMonth = useMemo(() => new Date(), [])
  const scheduledByDay = useMemo(() => {
    const m = new Map<string, MarketingPostWithRelations[]>()
    for (const p of posts) {
      if (p.status !== 'scheduled' || !p.scheduled_at) continue
      const d = new Date(p.scheduled_at)
      const key = ymd(d)
      const arr = m.get(key) ?? []
      arr.push(p)
      m.set(key, arr)
    }
    return m
  }, [posts])

  const filterList = (st: MarketingPostStatus | 'all') =>
    st === 'all' ? posts : posts.filter((p) => p.status === st)

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 via-white to-slate-50 text-ink dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 dark:text-slate-50">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple to-brand-teal text-white shadow-lg">
              <Megaphone className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold tracking-tight">Marketing IA</h1>
              <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">PetVia · Instagram · somente admins internos</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {marketingDemoLocal ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
                Modo demo (mock)
              </span>
            ) : null}
            <Button variant="outline" size="sm" type="button" onClick={() => void navigate('/app/dashboard')}>
              ← Voltar ao app
            </Button>
            <Button size="sm" leftIcon={<Sparkles className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
              Criar novo post
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Card padding="md" className="border-slate-200/80 dark:border-white/10">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Rascunhos</div>
            <div className="mt-1 text-2xl font-extrabold">{stats.drafts}</div>
          </Card>
          <Card padding="md" className="border-slate-200/80 dark:border-white/10">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Agendados</div>
            <div className="mt-1 text-2xl font-extrabold">{stats.scheduled}</div>
          </Card>
          <Card padding="md" className="border-slate-200/80 dark:border-white/10">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Publicados</div>
            <div className="mt-1 text-2xl font-extrabold">{stats.published}</div>
          </Card>
          <Card padding="md" className="border-slate-200/80 dark:border-white/10">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Leads (campo)</div>
            <div className="mt-1 text-2xl font-extrabold">{stats.leads}</div>
          </Card>
          <Card padding="md" className="border-slate-200/80 dark:border-white/10">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Melhor post</div>
            <div className="mt-1 truncate text-sm font-bold text-slate-800 dark:text-slate-100">
              {stats.best?.title ?? '—'}
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="space-y-4">
            <Card padding="md" className="border-slate-200/80 dark:border-white/10">
              <div className="mb-3 flex items-center gap-2 text-sm font-extrabold">
                <CalendarDays className="h-4 w-4 text-brand-purple" />
                Calendário editorial
              </div>
              <div className="text-center text-xs font-bold text-slate-500">
                {calendarMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-slate-400">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {daysInMonthGrid(calendarMonth).map(({ date, inMonth }, i) => {
                  const key = ymd(date)
                  const count = (scheduledByDay.get(key) ?? []).length
                  return (
                    <div
                      key={i}
                      className={`flex min-h-10 flex-col items-center justify-center rounded-xl border text-[11px] font-semibold ${
                        inMonth
                          ? 'border-slate-200/80 bg-white dark:border-white/10 dark:bg-slate-900/40'
                          : 'border-transparent bg-slate-50/50 text-slate-300 dark:bg-slate-900/20 dark:text-slate-600'
                      }`}
                    >
                      <span>{date.getDate()}</span>
                      {count > 0 ? (
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-brand-teal" title={`${count} post(s)`} />
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card padding="md" className="border-slate-200/80 dark:border-white/10">
              <Tabs defaultValue="draft">
                <TabsList className="w-full flex-wrap">
                  <TabsTrigger value="draft">Rascunhos</TabsTrigger>
                  <TabsTrigger value="scheduled">Agendados</TabsTrigger>
                  <TabsTrigger value="published">Publicados</TabsTrigger>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                </TabsList>
                <TabsContent value="draft">
                  <PostListMini items={filterList('draft')} selectedId={effectiveSelectedId} onSelect={setSelectedId} />
                </TabsContent>
                <TabsContent value="scheduled">
                  <PostListMini items={filterList('scheduled')} selectedId={effectiveSelectedId} onSelect={setSelectedId} />
                </TabsContent>
                <TabsContent value="published">
                  <PostListMini items={filterList('published')} selectedId={effectiveSelectedId} onSelect={setSelectedId} />
                </TabsContent>
                <TabsContent value="all">
                  <PostListMini items={filterList('all')} selectedId={effectiveSelectedId} onSelect={setSelectedId} />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          <Card padding="lg" className="border-slate-200/80 dark:border-white/10">
            {!selected ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">Nenhum post ainda. Crie um com IA.</p>
            ) : (
              <MarketingPostEditor
                key={`${selected.id}-${selected.updated_at}`}
                post={selected}
                marketingDemoLocal={marketingDemoLocal}
                onInvalidate={invalidate}
              />
            )}
          </Card>
        </div>
      </main>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-[min(92vw,520px)]">
          <DialogHeader>
            <DialogTitle>Novo post com IA</DialogTitle>
            <DialogDescription>
              A IA gera título, legenda, CTA, hashtags, roteiro visual e variações A/B. O post nasce como rascunho — nunca publicamos sem
              aprovação.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label className="mb-1.5 block">Objetivo</Label>
              <Select value={nObj} onValueChange={(v) => setNObj(v as MarketingObjective)}>
                <SelectTrigger>
                  <SelectValue placeholder="Objetivo" />
                </SelectTrigger>
                <SelectContent>
                  {OBJECTIVES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Formato</Label>
              <Select value={nFmt} onValueChange={(v) => setNFmt(v as MarketingFormat)}>
                <SelectTrigger>
                  <SelectValue placeholder="Formato" />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Tom de voz</Label>
              <Select value={nTone} onValueChange={(v) => setNTone(v as MarketingTone)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tom" />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input label="Público-alvo" value={nAudience} onChange={(e) => setNAudience(e.target.value)} placeholder="Ex.: donos de clínica em crescimento" />
            <div>
              <Label className="mb-1.5 block normal-case">Contexto extra</Label>
              <Textarea value={nExtra} onChange={(e) => setNExtra(e.target.value)} placeholder="Campanha, data comemorativa, produto em destaque…" />
            </div>
            <Button className="w-full" loading={generateM.isPending} disabled={marketingDemoLocal} onClick={() => generateM.mutate()}>
              Gerar com IA
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MarketingPostEditor({
  post,
  marketingDemoLocal,
  onInvalidate,
}: {
  post: MarketingPostWithRelations
  marketingDemoLocal: boolean
  onInvalidate: () => void
}) {
  const [edTitle, setEdTitle] = useState(post.title)
  const [edCaption, setEdCaption] = useState(post.caption)
  const [edCta, setEdCta] = useState(post.cta)
  const [edTags, setEdTags] = useState((post.hashtags ?? []).join(', '))
  const [edVisual, setEdVisual] = useState(post.visual_prompt ?? '')
  const [edScript, setEdScript] = useState(post.visual_script ?? '')
  const [edImage, setEdImage] = useState(post.image_url ?? '')
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleValue, setScheduleValue] = useState('')

  const saveDraftM = useMutation({
    mutationFn: async () => {
      if (marketingDemoLocal) return
      const hashtags = edTags
        .split(/[,#\s]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.replace(/^#/, ''))
      await marketingPostService.updateMarketingPost(post.id, {
        title: edTitle,
        caption: edCaption,
        cta: edCta,
        hashtags,
        visual_prompt: edVisual || null,
        visual_script: edScript || null,
        image_url: edImage || null,
        ...(post.status === 'draft' ? { status: 'draft' as const } : {}),
      })
    },
    onSuccess: () => {
      toast.success('Rascunho salvo.')
      onInvalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const approveM = useMutation({
    mutationFn: async () => {
      if (marketingDemoLocal) return
      if (post.status !== 'draft') throw new Error('Só é possível aprovar a partir de rascunho.')
      await marketingPostService.updateMarketingPost(post.id, { status: 'approved' })
    },
    onSuccess: () => {
      toast.success('Post aprovado. Agora você pode agendar ou publicar.')
      onInvalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const rejectM = useMutation({
    mutationFn: async () => {
      if (marketingDemoLocal) return
      await marketingPostService.updateMarketingPost(post.id, { status: 'rejected' })
    },
    onSuccess: () => {
      toast.success('Post rejeitado.')
      onInvalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const scheduleM = useMutation({
    mutationFn: async () => {
      if (marketingDemoLocal) return
      if (post.status !== 'approved') throw new Error('Apenas posts aprovados podem ser agendados.')
      if (!scheduleValue) throw new Error('Escolha data e hora.')
      const iso = new Date(scheduleValue).toISOString()
      await marketingPostService.updateMarketingPost(post.id, {
        status: 'scheduled',
        scheduled_at: iso,
      })
    },
    onSuccess: () => {
      toast.success('Post agendado.')
      setScheduleOpen(false)
      onInvalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const publishM = useMutation({
    mutationFn: async () => {
      if (marketingDemoLocal) return
      await marketingPostService.invokePublishInstagramPost(post.id)
    },
    onSuccess: () => {
      toast.success('Publicação enviada ao Instagram.')
      onInvalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const metricsM = useMutation({
    mutationFn: async () => {
      if (marketingDemoLocal) return
      await marketingPostService.invokeCollectInstagramMetrics(post.id)
    },
    onSuccess: () => {
      toast.success('Métricas coletadas.')
      onInvalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const regenerateM = useMutation({
    mutationFn: async () => {
      if (marketingDemoLocal) throw new Error('Modo demo.')
      await marketingPostService.invokeGenerateMarketingPost({
        objective: post.objective,
        format: post.format,
        tone: (post.tone as MarketingTone) || 'professional',
        target_audience: post.target_audience ?? undefined,
        extra_context: post.extra_context ?? undefined,
      })
    },
    onSuccess: () => {
      toast.success('Nova versão gerada (novo rascunho).')
      onInvalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300">
              {statusLabel(post.status)}
            </div>
            <h2 className="mt-2 text-xl font-extrabold tracking-tight">Editor</h2>
            <p className="text-xs text-slate-500">
              {OBJECTIVES.find((o) => o.value === post.objective)?.label} · {FORMATS.find((f) => f.value === post.format)?.label}
            </p>
          </div>
          {post.instagram_permalink ? (
            <a
              href={post.instagram_permalink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-brand-purple hover:bg-slate-50 dark:border-white/10 dark:hover:bg-slate-900/60"
            >
              Ver no Instagram <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="space-y-3">
            <Input label="Título" value={edTitle} onChange={(e) => setEdTitle(e.target.value)} />
            <div>
              <Label className="mb-1.5 block normal-case">Legenda</Label>
              <Textarea value={edCaption} onChange={(e) => setEdCaption(e.target.value)} />
            </div>
            <Input label="CTA" value={edCta} onChange={(e) => setEdCta(e.target.value)} />
            <Input label="Hashtags (separadas por vírgula)" value={edTags} onChange={(e) => setEdTags(e.target.value)} />
            <div>
              <Label className="mb-1.5 block normal-case">Prompt visual / ideia de imagem</Label>
              <Textarea value={edVisual} onChange={(e) => setEdVisual(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block normal-case">Roteiro visual</Label>
              <Textarea value={edScript} onChange={(e) => setEdScript(e.target.value)} />
            </div>
            <Input
              label="URL da imagem (HTTPS público para publicar)"
              value={edImage}
              onChange={(e) => setEdImage(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Preview Instagram</div>
            <div className="mx-auto w-[min(100%,280px)] rounded-[2rem] border-[10px] border-slate-900 bg-slate-900 p-2 shadow-2xl">
              <div className="overflow-hidden rounded-[1.25rem] bg-black">
                <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                  {edImage ? (
                    <img src={edImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-6 text-center text-slate-400">
                      <ImageIcon className="h-10 w-10 opacity-50" />
                      <span className="text-xs">Adicione uma URL de imagem pública</span>
                    </div>
                  )}
                </div>
                <div className="max-h-40 space-y-1 overflow-y-auto p-3 text-xs leading-relaxed text-white">
                  <p className="font-bold">{edTitle || 'Título'}</p>
                  <p className="whitespace-pre-wrap opacity-90">{edCaption || 'Legenda…'}</p>
                  <p className="font-semibold text-brand-teal">{edCta || 'CTA'}</p>
                  <p className="text-[10px] text-slate-400">
                    {edTags
                      .split(/[,#\s]+/)
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((s) => `#${s.replace(/^#/, '')}`)
                      .join(' ')}
                  </p>
                </div>
              </div>
            </div>

            {(post.marketing_post_variants ?? []).length > 0 ? (
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                  <BarChart3 className="h-4 w-4" />
                  Variações A/B
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(post.marketing_post_variants ?? []).map((v) => (
                    <div
                      key={v.id}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs dark:border-white/10 dark:bg-slate-900/50"
                    >
                      <div className="font-extrabold text-brand-purple">Variação {v.variant_name}</div>
                      <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{v.title}</div>
                      <p className="mt-1 line-clamp-4 text-slate-600 dark:text-slate-400">{v.caption}</p>
                      {v.score != null ? <div className="mt-2 text-[10px] font-bold text-slate-500">Score {v.score}</div> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {(post.marketing_post_metrics ?? []).length > 0 ? (
              <div>
                <div className="mb-2 text-xs font-bold uppercase text-slate-500">Últimas métricas</div>
                <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                  {(() => {
                    const m = [...(post.marketing_post_metrics ?? [])].sort(
                      (a, b) => new Date(b.collected_at).getTime() - new Date(a.collected_at).getTime(),
                    )[0]
                    if (!m) return null
                    return (
                      <>
                        <MetricPill label="Curtidas" v={m.likes_count} />
                        <MetricPill label="Comentários" v={m.comments_count} />
                        <MetricPill label="Alcance" v={m.reach} />
                        <MetricPill label="Impressões" v={m.impressions} />
                        <MetricPill label="Salvos" v={m.saves} />
                        <MetricPill label="Compart." v={m.shares} />
                      </>
                    )
                  })()}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-200/80 pt-4 dark:border-white/10">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            loading={regenerateM.isPending}
            disabled={marketingDemoLocal}
            onClick={() => regenerateM.mutate()}
          >
            Gerar novamente
          </Button>
          <Button variant="outline" size="sm" loading={saveDraftM.isPending} onClick={() => saveDraftM.mutate()}>
            Salvar rascunho
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={post.status !== 'draft' || marketingDemoLocal}
            loading={approveM.isPending}
            onClick={() => approveM.mutate()}
          >
            Aprovar
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={post.status !== 'approved' || marketingDemoLocal}
            onClick={() => {
              setScheduleValue(
                post.scheduled_at
                  ? new Date(post.scheduled_at).toISOString().slice(0, 16)
                  : new Date(Date.now() + 3600_000).toISOString().slice(0, 16),
              )
              setScheduleOpen(true)
            }}
          >
            Agendar
          </Button>
          <Button
            size="sm"
            disabled={!['approved', 'scheduled'].includes(post.status) || marketingDemoLocal}
            loading={publishM.isPending}
            onClick={() => {
              if (post.status === 'draft') {
                toast.error('Não é possível publicar rascunho sem aprovação humana.')
                return
              }
              publishM.mutate()
            }}
          >
            Publicar agora
          </Button>
          <Button variant="ghost" size="sm" disabled={marketingDemoLocal} loading={rejectM.isPending} onClick={() => rejectM.mutate()}>
            Rejeitar
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={post.status !== 'published' || marketingDemoLocal}
            loading={metricsM.isPending}
            onClick={() => metricsM.mutate()}
          >
            Coletar métricas
          </Button>
        </div>
      </div>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="w-[min(92vw,400px)]">
          <DialogHeader>
            <DialogTitle>Agendar publicação</DialogTitle>
            <DialogDescription>O post precisa estar aprovado. No horário, o cron chama o publicador (Edge Function).</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              label="Data e hora (local)"
              type="datetime-local"
              value={scheduleValue}
              onChange={(e) => setScheduleValue(e.target.value)}
            />
            <Button loading={scheduleM.isPending} onClick={() => scheduleM.mutate()}>
              Confirmar agendamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function MetricPill({ label, v }: { label: string; v: number }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white px-2 py-1.5 dark:border-white/10 dark:bg-slate-900/40">
      <div className="text-[10px] font-bold uppercase text-slate-400">{label}</div>
      <div className="text-sm font-extrabold">{v.toLocaleString('pt-BR')}</div>
    </div>
  )
}

function PostListMini({
  items,
  selectedId,
  onSelect,
}: {
  items: MarketingPostWithRelations[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  if (!items.length) {
    return <p className="py-6 text-center text-sm text-slate-500">Nenhum post nesta lista.</p>
  }
  return (
    <ul className="max-h-[min(52vh,420px)] space-y-2 overflow-y-auto pr-1">
      {items.map((p) => (
        <li key={p.id}>
          <button
            type="button"
            onClick={() => onSelect(p.id)}
            className={`w-full rounded-2xl border px-3 py-2.5 text-left text-sm transition ${
              p.id === selectedId
                ? 'border-brand-purple/40 bg-brand-purple/10 font-bold text-slate-900 dark:text-white'
                : 'border-slate-200/80 bg-white hover:border-brand-purple/25 dark:border-white/10 dark:bg-slate-900/30'
            }`}
          >
            <div className="truncate font-bold">{p.title || 'Sem título'}</div>
            <div className="mt-0.5 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
              <span>{statusLabel(p.status)}</span>
              {p.scheduled_at ? <span>{new Date(p.scheduled_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span> : null}
            </div>
          </button>
        </li>
      ))}
    </ul>
  )
}
