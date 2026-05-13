import { ArrowUpRight, Bot, CalendarClock, MessageSquare, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { attendanceSeries, dashboardMetrics, recentMessages, upcomingAppointments } from '../data/mock'
import { Card } from '../components/ui/Card'

export default function Dashboard() {
  const max = Math.max(...attendanceSeries, 1)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((m) => (
          <Card key={m.id} className="relative overflow-hidden">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-brand-purple/15 to-brand-teal/10 blur-2xl" />
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{m.label}</div>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div className="text-2xl font-extrabold tracking-tight">{m.value}</div>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/5 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                <ArrowUpRight className="h-3.5 w-3.5" />
                {m.delta}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Próximas consultas</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Hoje · ordenado por horário</p>
            </div>
            <Link
              to="/app/agenda"
              className="rounded-2xl border border-slate-200/80 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-purple/35 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:border-brand-purple/35"
            >
              Ver agenda
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {upcomingAppointments.map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/50 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-slate-950/35"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple/15 to-brand-blue/10 text-sm font-extrabold text-brand-purple dark:text-white">
                    {a.time}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold">
                      {a.pet}{' '}
                      <span className="font-semibold text-slate-500 dark:text-slate-400">· {a.owner}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                      {a.service} · <span className="font-semibold text-slate-700 dark:text-slate-300">{a.vet}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <span className="rounded-full bg-brand-teal/10 px-2 py-1 text-[11px] font-semibold text-brand-teal ring-1 ring-brand-teal/20">
                    confirmado
                  </span>
                  <CalendarClock className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-extrabold tracking-tight">Mensagens recentes</h2>
            <MessageSquare className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-4 space-y-3">
            {recentMessages.map((m) => (
              <button
                key={m.id}
                type="button"
                className="w-full rounded-2xl border border-transparent bg-slate-900/[0.02] p-3 text-left transition hover:border-brand-purple/25 hover:bg-white/70 dark:bg-white/[0.03] dark:hover:border-white/10 dark:hover:bg-slate-950/45"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-extrabold">{m.from}</div>
                  <div className="shrink-0 text-[11px] font-semibold text-slate-500">{m.time}</div>
                </div>
                <div className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">{m.preview}</div>
                {m.unread ? (
                  <div className="mt-2 inline-flex rounded-full bg-brand-purple/10 px-2 py-0.5 text-[11px] font-semibold text-brand-purple dark:text-brand-teal">
                    não lida
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Atendimentos (7 dias)</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Mock · tendência semanal</p>
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
                    <div
                      className="w-[72%] max-w-[52px] rounded-2xl bg-gradient-to-t from-brand-purple via-brand-blue to-brand-teal opacity-90 shadow-lg shadow-brand-purple/15"
                      style={{ height: `${Math.max(12, h)}%` }}
                    />
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">D{idx + 1}</div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br from-brand-purple/25 to-brand-teal/15 blur-2xl" />
          <div className="relative flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple to-brand-blue text-white shadow-lg">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">IA ativa 24h</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Respostas, lembretes e triagem automática com supervisão da equipe.
              </p>
            </div>
          </div>

          <div className="relative mt-5 space-y-2 rounded-2xl border border-white/40 bg-white/50 p-3 text-sm dark:border-white/10 dark:bg-slate-950/35">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Fila automática</span>
              <Sparkles className="h-4 w-4 text-brand-teal" />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">7 conversas com sugestão pronta · 2 aguardando aprovação</div>
            <Link
              to="/app/conversas"
              className="mt-2 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-brand-purple to-brand-blue py-2.5 text-sm font-extrabold text-white shadow-lg shadow-brand-purple/20 transition hover:brightness-[1.03]"
            >
              Abrir central de conversas
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
