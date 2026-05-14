import { motion } from 'framer-motion'
import { Activity, Bot, MessageCircle, RefreshCw, Sparkles, Wallet } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { centralIaNodes, centralIaStats } from '../data/mock'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'

const thoughts = [
  'Analisando clientes inativos…',
  'Criando lembretes automáticos…',
  'Respondendo WhatsApp…',
  'Priorizando fila de triagem…',
  'Sugerindo encaixes na agenda…',
]

export default function CentralIA() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = window.setInterval(() => setIdx((v) => (v + 1) % thoughts.length), 2600)
    return () => window.clearInterval(t)
  }, [])

  const lines = useMemo(
    () =>
      centralIaNodes.map((n, i) => ({
        ...n,
        to: centralIaNodes[(i + 1) % centralIaNodes.length]!,
      })),
    [],
  )

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="relative overflow-hidden lg:col-span-2" padding="lg">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-brand-purple/25 via-brand-blue/15 to-brand-teal/15 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2">
                <Badge tone="purple" leftIcon={<Sparkles className="h-3.5 w-3.5" />}>
                  cérebro operacional
                </Badge>
              </div>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight">Central IA</h2>
              <p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-400">
                Um painel vivo para sentir o ritmo da automação — fluxo, partículas e “pensamento” contínuo (mock).
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-3xl border border-slate-200/70 bg-white/55 px-3 py-2 text-sm font-semibold text-slate-700 shadow-inner dark:border-white/10 dark:bg-slate-950/35 dark:text-slate-200">
              <motion.span
                className="inline-flex h-2.5 w-2.5 rounded-full bg-brand-teal"
                animate={{ scale: [1, 1.25, 1], opacity: [0.75, 1, 0.75] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              IA respirando
            </div>
          </div>

          <div className="relative mt-8 overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-b from-white/70 to-white/30 p-6 shadow-inner dark:border-white/10 dark:from-slate-950/55 dark:to-slate-950/20">
            <div className="pointer-events-none absolute inset-0 opacity-70">
              {Array.from({ length: 18 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute h-1 w-1 rounded-full bg-brand-purple/35 dark:bg-white/20"
                  style={{ left: `${(i * 17) % 100}%`, top: `${(i * 23) % 100}%` }}
                  animate={{ y: [0, -10, 0], opacity: [0.2, 0.9, 0.2] }}
                  transition={{ duration: 3 + (i % 5) * 0.35, repeat: Infinity, delay: i * 0.08 }}
                />
              ))}
            </div>

            <div className="relative mx-auto aspect-[16/9] w-full max-w-3xl">
              <svg viewBox="0 0 100 100" className="h-full w-full">
                {lines.map((l, i) => (
                  <motion.line
                    key={`${l.id}-${i}`}
                    x1={l.x}
                    y1={l.y}
                    x2={l.to.x}
                    y2={l.to.y}
                    stroke="url(#gx)"
                    strokeWidth="0.55"
                    strokeLinecap="round"
                    initial={{ opacity: 0.12 }}
                    animate={{ opacity: [0.12, 0.55, 0.12] }}
                    transition={{ duration: 2.8, delay: i * 0.12, repeat: Infinity, ease: 'easeInOut' }}
                  />
                ))}
                <defs>
                  <linearGradient id="gx" x1="0" x2="1" y1="0" y2="1">
                    <stop stopColor="#7c3aed" stopOpacity="0.55" />
                    <stop offset="1" stopColor="#22d3c5" stopOpacity="0.45" />
                  </linearGradient>
                </defs>
              </svg>

              {centralIaNodes.map((n) => (
                <motion.div
                  key={n.id}
                  className="absolute"
                  style={{ left: `${n.x}%`, top: `${n.y}%`, transform: 'translate(-50%, -50%)' }}
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/75 px-2.5 py-1.5 text-[10px] font-bold text-slate-800 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-slate-950/55 dark:text-slate-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-purple shadow-[0_0_12px_rgba(124,58,237,0.65)]" />
                    {n.label}
                  </div>
                </motion.div>
              ))}

              <motion.div
                className="absolute left-1/2 top-1/2 w-[min(220px,52%)] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-white/70 bg-white/70 p-4 text-center shadow-[0_18px_60px_rgba(124,58,237,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55"
                animate={{ scale: [1, 1.01, 1] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple to-brand-blue text-white shadow-lg">
                  <Bot className="h-6 w-6" />
                </div>
                <div className="mt-2 text-sm font-extrabold">IA pensando</div>
                <div className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">{thoughts[idx]}</div>
                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '2.8s' }} />
                  processamento contínuo
                </div>
              </motion.div>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {centralIaStats.map((s) => (
            <Card key={s.id} padding="sm" className="relative overflow-hidden">
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-brand-blue/15 to-brand-teal/10 blur-2xl" />
              <div className="relative text-xs font-semibold text-slate-500 dark:text-slate-400">{s.label}</div>
              <div className="relative mt-1 text-2xl font-extrabold tracking-tight">{s.value}</div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card padding="sm" className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold">WhatsApp</div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Fila estável · respostas sugeridas prontas.</div>
          </div>
        </Card>
        <Card padding="sm" className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-purple/10 text-brand-purple dark:text-white">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold">Operação</div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Automações competindo por prioridade (mock).</div>
          </div>
        </Card>
        <Card padding="sm" className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold">Financeiro</div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Cobranças e confirmações com baixa fricção.</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
