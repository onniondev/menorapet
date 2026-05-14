import { motion } from 'framer-motion'
import {
  ArrowRight,
  Bell,
  CalendarClock,
  MessageCircle,
  Sparkles,
  Stethoscope,
  Syringe,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  attendanceSeries,
  clinicLiveTimeline,
  dashboardKpis,
  iaInsightCards,
  iaSmartAlerts,
  upcomingAppointments,
} from '../data/mock'
import { IaOrbAvatar } from '../components/motion/IaOrbAvatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

function greetingWord() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function alertTone(t: (typeof iaSmartAlerts)[number]['tone']) {
  if (t === 'warning') return 'amber' as const
  if (t === 'success') return 'success' as const
  return 'info' as const
}

const list = { show: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const max = Math.max(...attendanceSeries, 1)

  const displayName = profile?.full_name?.trim() || profile?.email?.split('@')[0] || 'Veterinário(a)'

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={list}>
      <motion.section variants={item} className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/55 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.1)] backdrop-blur-2xl ring-1 ring-white/70 dark:border-white/10 dark:bg-slate-950/40 dark:shadow-[0_18px_70px_rgba(0,0,0,0.45)] dark:ring-white/5 sm:p-7">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-gradient-to-br from-brand-purple/25 via-brand-blue/15 to-brand-teal/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <IaOrbAvatar size={76} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="purple" leftIcon={<Sparkles className="h-3.5 w-3.5" />}>
                  IA viva
                </Badge>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">atualizado agora</span>
              </div>
              <h1 className="mt-2 text-balance text-2xl font-extrabold tracking-tight sm:text-3xl">
                {greetingWord()}, {displayName} <span className="inline-block animate-float-soft">👋</span>
              </h1>
              <p className="mt-2 max-w-xl text-pretty text-sm font-medium text-slate-600 dark:text-slate-300">
                Sua clínica está sob controle. A IA está cuidando da triagem, lembretes e micro‑decisões enquanto você foca no que importa.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="md" type="button" rightIcon={<MessageCircle className="h-4 w-4" />} onClick={() => navigate('/app/conversas')}>
                  Abrir conversas
                </Button>
                <Button
                  size="md"
                  type="button"
                  variant="outline"
                  rightIcon={<Sparkles className="h-4 w-4" />}
                  onClick={() => navigate('/app/central-ia')}
                >
                  Central IA
                </Button>
              </div>
            </div>
          </div>

          <div className="relative w-full max-w-sm rounded-3xl border border-slate-200/70 bg-white/55 p-4 shadow-inner dark:border-white/10 dark:bg-slate-950/35">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Resumo emocional</div>
            <div className="mt-2 text-sm font-bold text-ink dark:text-white">Tudo fluindo</div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Sem gargalos críticos · 3 alertas leves</div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-900/5 dark:bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-purple via-brand-blue to-brand-teal"
                initial={{ width: '42%' }}
                animate={{ width: ['42%', '86%', '68%', '42%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </div>
      </motion.section>

      <motion.div variants={item} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardKpis.map((k) => (
          <Card key={k.id} padding="sm" className="group relative overflow-hidden">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-brand-purple/15 to-brand-teal/10 opacity-0 blur-2xl transition group-hover:opacity-100" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{k.label}</div>
                <div className="mt-2 text-2xl font-extrabold tracking-tight">{k.value}</div>
                <div className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">{k.hint}</div>
              </div>
              <span className="rounded-2xl bg-slate-900/[0.03] p-2 ring-1 ring-slate-900/5 dark:bg-white/[0.04] dark:ring-white/10">
                {k.accent === 'purple' ? (
                  <Stethoscope className="h-4 w-4 text-brand-purple" />
                ) : k.accent === 'blue' ? (
                  <TrendingUp className="h-4 w-4 text-brand-blue" />
                ) : (
                  <Syringe className="h-4 w-4 text-brand-teal" />
                )}
              </span>
            </div>
          </Card>
        ))}
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-5">
        <motion.div variants={item} className="lg:col-span-2">
          <Card padding="lg" className="h-full">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight">Alertas inteligentes</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Ações sugeridas · sem tabela, só clareza</p>
              </div>
              <Bell className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-5 space-y-3">
              {iaSmartAlerts.map((a) => (
                <div
                  key={a.id}
                  className="rounded-3xl border border-slate-200/70 bg-white/55 p-4 shadow-sm transition hover:border-brand-purple/25 hover:shadow-md dark:border-white/10 dark:bg-slate-950/35 dark:hover:border-brand-purple/30"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Badge tone={alertTone(a.tone)}>{a.title}</Badge>
                      <div className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{a.detail}</div>
                    </div>
                    <Button size="sm" variant="outline" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                      {a.action}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-3">
          <Card padding="lg" className="h-full">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight">Timeline viva da clínica</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Eventos recentes · sensação de movimento</p>
              </div>
              <Link to="/app/agenda" className="text-xs font-bold text-brand-purple hover:underline dark:text-brand-teal">
                Ver agenda
              </Link>
            </div>

            <div className="relative mt-6 space-y-0 pl-2">
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-brand-purple/35 via-brand-blue/25 to-brand-teal/25" />
              {clinicLiveTimeline.map((e, i) => (
                <motion.div
                  key={e.id}
                  className="relative pb-6 pl-10"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i }}
                >
                  <span className="absolute left-[9px] top-1.5 h-3 w-3 rounded-full bg-white ring-4 ring-brand-purple/25 dark:bg-slate-950 dark:ring-brand-purple/35" />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{e.time}</div>
                    <Badge tone="neutral">{e.tag}</Badge>
                  </div>
                  <div className="mt-1 text-sm font-extrabold">{e.title}</div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{e.detail}</div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div variants={item} className="lg:col-span-2 space-y-4">
          <Card padding="lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight">Consultas de hoje</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Cards vivos · status em camadas</p>
              </div>
              <CalendarClock className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {upcomingAppointments.map((a) => (
                <motion.div
                  key={a.id}
                  className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white/80 to-slate-50/50 p-4 shadow-sm dark:border-white/10 dark:from-slate-950/55 dark:to-slate-950/25"
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-extrabold text-brand-purple dark:text-brand-teal">{a.time}</div>
                    <Badge tone="teal">confirmado</Badge>
                  </div>
                  <div className="mt-2 text-base font-extrabold">
                    {a.pet}{' '}
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">· {a.owner}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">{a.service}</div>
                  <div className="mt-3 text-[11px] font-semibold text-slate-500">{a.vet}</div>
                </motion.div>
              ))}
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight">Atendimentos (7 dias)</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Mini gráfico · glow suave</p>
              </div>
              <span className="rounded-full bg-slate-900/5 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                +9% vs semana anterior
              </span>
            </div>
            <div className="mt-6 flex h-44 items-end justify-between gap-2">
              {attendanceSeries.map((v, idx) => {
                const h = Math.round((v / max) * 100)
                return (
                  <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                    <div className="relative flex h-36 w-full items-end justify-center">
                      <motion.div
                        className="w-[72%] max-w-[52px] rounded-2xl bg-gradient-to-t from-brand-purple via-brand-blue to-brand-teal shadow-[0_12px_30px_rgba(124,58,237,0.22)]"
                        initial={{ height: '12%' }}
                        animate={{ height: `${Math.max(12, h)}%` }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22, delay: idx * 0.04 }}
                      />
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500">D{idx + 1}</div>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item} className="space-y-4">
          {iaInsightCards.map((c) => (
            <Card key={c.id} padding="md" className="relative overflow-hidden">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-brand-blue/15 to-brand-teal/10 blur-2xl" />
              <div className="relative text-xs font-semibold text-slate-500 dark:text-slate-400">Insight IA</div>
              <div className="relative mt-2 text-lg font-extrabold">{c.title}</div>
              <div className="relative mt-1 text-2xl font-black tracking-tight text-transparent bg-gradient-to-r from-brand-purple to-brand-teal bg-clip-text">
                {c.value}
              </div>
              <div className="relative mt-2 text-sm text-slate-600 dark:text-slate-400">{c.detail}</div>
            </Card>
          ))}

          <Card padding="md" className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-purple/10 via-transparent to-brand-teal/10" />
            <div className="relative flex items-center gap-2 text-sm font-extrabold">
              <Wallet className="h-4 w-4 text-brand-purple" />
              Financeiro em um olhar
            </div>
            <div className="relative mt-2 text-xs text-slate-600 dark:text-slate-400">Pendências leves · nada crítico no mock.</div>
            <Link to="/app/financeiro" className="relative mt-4 inline-flex text-xs font-bold text-brand-purple hover:underline dark:text-brand-teal">
              Abrir financeiro →
            </Link>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
