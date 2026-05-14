import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  ChevronDown,
  DollarSign,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Percent,
  Plus,
  Sparkles,
  Star,
  Stethoscope,
  UserRound,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAiInsights } from '../hooks/useAiInsights'
import { useClinicContext } from '../hooks/useClinicContext'
import { useDashboardMetrics } from '../hooks/useDashboardMetrics'
import { useTodayAppointments } from '../hooks/useTodayAppointments'
import { useTodayReminders } from '../hooks/useTodayReminders'
import { useUnreadMessages } from '../hooks/useUnreadMessages'
import type { AppointmentStatus, AppointmentWithRelations, DashboardPeriod } from '../types/domain'

function greetingWord() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function formatBRLFromCents(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '—'
  }
}

function formatRelativeShort(iso: string) {
  try {
    const d = new Date(iso)
    const now = new Date()
    const sameDay =
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
    if (sameDay) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  } catch {
    return '—'
  }
}

function statusBadge(status: AppointmentStatus) {
  if (status === 'confirmed') return <Badge tone="success">Confirmado</Badge>
  if (status === 'pending') return <Badge tone="amber">Pendente</Badge>
  if (status === 'completed') return <Badge tone="neutral">Concluído</Badge>
  if (status === 'cancelled') return <Badge tone="neutral">Cancelado</Badge>
  return <Badge tone="info">No-show</Badge>
}

const periodOptions: { id: DashboardPeriod; label: string }[] = [
  { id: 'today', label: 'Hoje' },
  { id: '7d', label: '7 dias' },
  { id: '30d', label: '30 dias' },
  { id: 'month', label: 'Este mês' },
]

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-28 rounded-3xl bg-slate-200/80 dark:bg-slate-800/80" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 rounded-3xl bg-slate-200/80 dark:bg-slate-800/80" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-80 rounded-3xl bg-slate-200/80 lg:col-span-2 dark:bg-slate-800/80" />
        <div className="h-80 rounded-3xl bg-slate-200/80 dark:bg-slate-800/80" />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { clinicId, clinic, isLoading: clinicLoading } = useClinicContext()
  const [period, setPeriod] = useState<DashboardPeriod>('7d')
  const [fabOpen, setFabOpen] = useState(false)
  const fabRef = useRef<HTMLDivElement | null>(null)

  const metricsQ = useDashboardMetrics(clinicId, period, clinic?.plan ?? null)
  const apptsQ = useTodayAppointments(clinicId)
  const msgsQ = useUnreadMessages(clinicId)
  const remindersQ = useTodayReminders(clinicId)
  const insightsQ = useAiInsights(clinicId)

  useEffect(() => {
    if (metricsQ.isError) toast.error('Não foi possível carregar os indicadores do dashboard.')
  }, [metricsQ.isError])

  useEffect(() => {
    if (apptsQ.isError) toast.error('Não foi possível carregar as consultas de hoje.')
  }, [apptsQ.isError])

  useEffect(() => {
    if (msgsQ.isError) toast.error('Não foi possível carregar mensagens não lidas.')
  }, [msgsQ.isError])

  useEffect(() => {
    if (remindersQ.isError) toast.error('Não foi possível carregar lembretes.')
  }, [remindersQ.isError])

  useEffect(() => {
    if (insightsQ.isError) toast.error('Não foi possível carregar insights da IA.')
  }, [insightsQ.isError])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!fabRef.current) return
      if (!fabRef.current.contains(e.target as Node)) setFabOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const displayName = profile?.full_name?.trim() || profile?.email?.split('@')[0] || 'Profissional'

  const m = metricsQ.data
  const donutData = useMemo(() => {
    const rows = m?.serviceMixMonth ?? []
    const total = rows.reduce((acc, r) => acc + r.count, 0) || 1
    return rows.map((r) => ({ ...r, pct: Math.round((r.count / total) * 1000) / 10 }))
  }, [m?.serviceMixMonth])

  const lineData = m?.attendanceSeries ?? []
  const donutTotal = useMemo(() => (m?.serviceMixMonth ?? []).reduce((a, b) => a + b.count, 0), [m?.serviceMixMonth])

  const dataLoading =
    Boolean(clinicId) &&
    (metricsQ.isLoading || apptsQ.isLoading || msgsQ.isLoading || remindersQ.isLoading || insightsQ.isLoading)
  const loading = clinicLoading || (dataLoading && !metricsQ.isError)
  const metricsFailed = Boolean(clinicId) && metricsQ.isError

  if (!clinicId) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-[#E2E8F0] bg-white p-8 text-sm font-semibold text-[#64748B] shadow-sm">
        {clinicLoading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-brand-purple" />
            Carregando clínica…
          </span>
        ) : (
          'Nenhuma clínica selecionada.'
        )}
      </div>
    )
  }

  return (
    <div className="relative space-y-6 text-[#0F172A]">
      <section className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-balance text-2xl font-extrabold tracking-tight sm:text-3xl">
              {greetingWord()}, {displayName}! <span className="inline-block">👋</span>
            </h1>
            <p className="mt-2 max-w-2xl text-pretty text-sm font-medium text-[#64748B]">Aqui está o que acontece na sua clínica hoje.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#64748B]">Período</span>
            <div className="inline-flex rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-1">
              {periodOptions.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id)}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                    period === p.id ? 'bg-white text-brand-purple shadow-sm ring-1 ring-brand-purple/15' : 'text-[#64748B] hover:text-ink'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {metricsFailed ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-900">
          Não foi possível carregar os indicadores. Verifique permissões no Supabase (RLS) e se as tabelas do domínio foram criadas.
        </div>
      ) : null}

      {loading ? <DashboardSkeleton /> : null}

      {!loading && m ? (
        <motion.div className="space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <KpiCard
              title="Atendimentos hoje"
              value={String(m.appointmentsToday)}
              hint={m.appointmentsTodayDeltaPct != null ? `${m.appointmentsTodayDeltaPct >= 0 ? '+' : ''}${m.appointmentsTodayDeltaPct}% vs ontem` : 'Sem base de ontem'}
              actionLabel="Ver agenda"
              onAction={() => navigate('/app/agenda')}
              icon={<CalendarDays className="h-5 w-5 text-brand-purple" />}
              accent="purple"
            />
            <KpiCard
              title="Pendências"
              value={String(m.pendencias)}
              hint="Consultas pendentes + mensagens + pagamentos"
              actionLabel="Ver agora"
              onAction={() => navigate('/app/agenda')}
              icon={<CalendarRange className="h-5 w-5 text-orange-500" />}
              accent="orange"
            />
            <KpiCard
              title="Retornos agendados"
              value={String(m.retornosProximos7d)}
              hint="Próximos 7 dias"
              actionLabel="Abrir agenda"
              onAction={() => navigate('/app/agenda')}
              icon={<Stethoscope className="h-5 w-5 text-brand-teal" />}
              accent="teal"
            />
            <KpiCard
              title="Faturamento do mês"
              value={formatBRLFromCents(m.revenueMonthCents)}
              hint={m.revenueMonthDeltaPct != null ? `${m.revenueMonthDeltaPct >= 0 ? '+' : ''}${m.revenueMonthDeltaPct}% vs mês passado` : 'Sem base mês passado'}
              actionLabel="Ver financeiro"
              onAction={() => navigate('/app/financeiro')}
              icon={<DollarSign className="h-5 w-5 text-brand-purple" />}
              accent="purple"
            />
            <KpiCard
              title="Clientes ativos"
              value={String(m.activeClients90d)}
              hint="Com consulta ou mensagem (90 dias)"
              actionLabel="Ver clientes"
              onAction={() => navigate('/app/clientes')}
              icon={<Users className="h-5 w-5 text-brand-blue" />}
              accent="blue"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-5">
            <Card padding="lg" className="border-[#E2E8F0] bg-white shadow-sm xl:col-span-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight">Resumo de atendimentos</h2>
                  <p className="mt-1 text-sm font-medium text-[#64748B]">Consultas · vacinas · exames</p>
                </div>
                <Badge tone="purple" leftIcon={<BarChart3 className="h-3.5 w-3.5" />}>
                  {periodOptions.find((p) => p.id === period)?.label}
                </Badge>
              </div>

              <div className="mt-4 h-72 w-full">
                {lineData.length === 0 ? (
                  <EmptyHint text="Sem atendimentos no período selecionado." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 16,
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 12px 40px rgba(15,23,42,0.08)',
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="consultas" name="Consultas" stroke="#7C3AED" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="vacinas" name="Vacinas" stroke="#3B82F6" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="exames" name="Exames" stroke="#22D3C5" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            <Card padding="lg" className="border-[#E2E8F0] bg-white shadow-sm xl:col-span-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight">Consultas por serviço</h2>
                  <p className="mt-1 text-sm font-medium text-[#64748B]">Mês atual</p>
                </div>
              </div>

              <div className="relative mt-2 h-64 w-full">
                {donutTotal === 0 ? (
                  <EmptyHint text="Sem consultas registradas no mês." />
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={donutData} dataKey="count" nameKey="service_type" innerRadius={62} outerRadius={86} paddingAngle={2}>
                          {donutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, _name, item) => {
                            const p = (item?.payload as { pct?: number } | undefined)?.pct
                            return [`${value} (${p ?? 0}%)`, 'Total']
                          }}
                          contentStyle={{
                            borderRadius: 16,
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 12px 40px rgba(15,23,42,0.08)',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-[11px] font-extrabold text-[#64748B]">Total</div>
                        <div className="text-2xl font-black tracking-tight text-[#0F172A]">{donutTotal}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-2 space-y-2">
                {donutData.slice(0, 6).map((d) => (
                  <div key={d.service_type} className="flex items-center justify-between gap-3 text-xs font-semibold">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.fill }} />
                      <span className="truncate capitalize text-[#64748B]">{d.service_type}</span>
                    </div>
                    <div className="shrink-0 text-[#0F172A]">
                      {d.count}{' '}
                      <span className="text-[#64748B]">({d.pct}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MiniStat title="Taxa de retorno" value={m.returnRateMonthPct != null ? `${m.returnRateMonthPct}%` : '—'} hint="No mês atual" icon={<Percent className="h-4 w-4 text-brand-purple" />} />
            <MiniStat
              title="Satisfação"
              value={m.satisfactionScore != null ? `${m.satisfactionScore}/5` : '—'}
              hint={m.satisfactionReviews != null ? `Com base em ${m.satisfactionReviews} avaliações` : 'Sem avaliações no banco'}
              icon={<Star className="h-4 w-4 text-brand-teal" />}
            />
            <MiniStat
              title="Clientes inativos"
              value={String(m.inactiveClients90d)}
              hint="Sem consulta nos últimos 90 dias"
              actionLabel="Abrir clientes"
              onAction={() => navigate('/app/clientes')}
              icon={<UserRound className="h-4 w-4 text-brand-blue" />}
            />
            <MiniStat
              title="Ticket médio"
              value={m.avgTicketCents != null ? formatBRLFromCents(m.avgTicketCents) : '—'}
              hint="Pagamentos pagos no mês"
              actionLabel="Ver financeiro"
              onAction={() => navigate('/app/financeiro')}
              icon={<DollarSign className="h-4 w-4 text-brand-purple" />}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-5">
            <Card padding="lg" className="border-[#E2E8F0] bg-white shadow-sm xl:col-span-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight">Próximas consultas</h2>
                  <p className="mt-1 text-sm font-medium text-[#64748B]">Hoje · ordenado por horário</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => navigate('/app/agenda')}>
                  Ver agenda completa →
                </Button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[860px] border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-left text-[11px] font-extrabold uppercase tracking-wide text-[#64748B]">
                      <th className="px-2 py-2">Horário</th>
                      <th className="px-2 py-2">Pet</th>
                      <th className="px-2 py-2">Tutor</th>
                      <th className="px-2 py-2">Tipo</th>
                      <th className="px-2 py-2">Veterinário</th>
                      <th className="px-2 py-2">Status</th>
                      <th className="px-2 py-2 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(apptsQ.data ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-2 py-10 text-center text-sm font-semibold text-[#64748B]">
                          Nenhuma consulta agendada para hoje.
                        </td>
                      </tr>
                    ) : (
                      (apptsQ.data ?? []).map((a) => (
                        <AppointmentRow
                          key={a.id}
                          a={a}
                          onChat={() => navigate('/app/conversas')}
                          onEdit={() => navigate('/app/agenda')}
                          onMore={() => navigate('/app/busca')}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="space-y-4 xl:col-span-2">
              <Card padding="lg" className="relative overflow-hidden border-transparent bg-gradient-to-br from-brand-purple via-brand-purple to-brand-blue text-white shadow-[0_18px_60px_rgba(124,58,237,0.35)]">
                <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold ring-1 ring-white/25">
                      <span className="h-2 w-2 rounded-full bg-brand-teal shadow-[0_0_18px_rgba(34,211,197,0.95)]" />
                      IA PetVia · Online
                    </div>
                    <h2 className="mt-3 text-xl font-black tracking-tight">Insights importantes</h2>
                    <p className="mt-2 max-w-md text-sm font-semibold text-white/85">Estou aqui para ajudar sua clínica a crescer.</p>
                  </div>
                  <Sparkles className="h-6 w-6 text-white/90" />
                </div>

                <ul className="relative mt-4 space-y-3">
                  {(insightsQ.data ?? []).length === 0 ? (
                    <li className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white/85 ring-1 ring-white/15">Sem insights abertos no momento.</li>
                  ) : (
                    (insightsQ.data ?? []).map((i) => (
                      <li key={i.id} className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white/90 ring-1 ring-white/15">
                        <div className="text-xs font-extrabold text-white/70">{i.type}</div>
                        <div className="mt-1 font-extrabold">{i.title}</div>
                        {i.description ? <div className="mt-1 text-xs font-semibold text-white/80">{i.description}</div> : null}
                      </li>
                    ))
                  )}
                </ul>

                <div className="relative mt-5">
                  <Button type="button" variant="social" className="w-full border-white/25 bg-white text-ink hover:bg-white/90" onClick={() => navigate('/app/central-ia')}>
                    Ver insights completos
                  </Button>
                </div>
              </Card>

              <Card padding="lg" className="border-[#E2E8F0] bg-white shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold tracking-tight">Mensagens não lidas</h2>
                    <p className="mt-1 text-sm font-medium text-[#64748B]">Prévia · {m.unreadMessages} total</p>
                  </div>
                  <Badge tone="purple">{m.unreadMessages}</Badge>
                </div>

                <div className="mt-4 space-y-3">
                  {(msgsQ.data ?? []).length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-4 py-6 text-center text-sm font-semibold text-[#64748B]">Tudo lido por aqui.</div>
                  ) : (
                    (msgsQ.data ?? []).map((msg) => (
                      <button
                        key={msg.id}
                        type="button"
                        onClick={() => navigate('/app/conversas')}
                        className="flex w-full items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-left transition hover:border-brand-purple/25 hover:bg-white"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple to-brand-blue text-xs font-black text-white">
                          {(msg.client_name ?? 'C').slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="truncate text-sm font-extrabold">{msg.client_name ?? 'Cliente'}</div>
                            <div className="shrink-0 text-[11px] font-bold text-[#64748B]">{formatRelativeShort(msg.created_at)}</div>
                          </div>
                          <div className="mt-1 line-clamp-2 text-xs font-semibold text-[#64748B]">{msg.content}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </Card>

              <Card padding="lg" className="border-[#E2E8F0] bg-white shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold tracking-tight">Lembretes de hoje</h2>
                    <p className="mt-1 text-sm font-medium text-[#64748B]">Operação do dia</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => navigate('/app/lembretes')}>
                    Ver todos
                  </Button>
                </div>

                <div className="mt-4 space-y-3">
                  {(remindersQ.data ?? []).length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-4 py-6 text-center text-sm font-semibold text-[#64748B]">Sem lembretes para hoje.</div>
                  ) : (
                    (remindersQ.data ?? []).map((r) => (
                      <div key={r.id} className="flex items-start justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm">
                        <div className="min-w-0">
                          <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#64748B]">{r.type}</div>
                          <div className="mt-1 truncate text-sm font-extrabold">{r.title}</div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-xs font-extrabold text-brand-purple">{formatTime(r.due_at)}</div>
                          <div className="mt-1">
                            <Badge tone="neutral">{r.status}</Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        </motion.div>
      ) : null}

      <div ref={fabRef} className="fixed bottom-24 right-5 z-40 lg:bottom-10 lg:right-10">
        <AnimatePresence>
          {fabOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="mb-3 w-[min(92vw,280px)] overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.18)]"
            >
              <div className="p-2">
                <FabAction label="Novo agendamento" onClick={() => { setFabOpen(false); navigate('/app/agenda') }} />
                <FabAction label="Novo cliente" onClick={() => { setFabOpen(false); navigate('/app/clientes') }} />
                <FabAction label="Novo pet" onClick={() => { setFabOpen(false); navigate('/app/pets') }} />
                <FabAction label="Novo lembrete" onClick={() => { setFabOpen(false); navigate('/app/lembretes') }} />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.button
          type="button"
          aria-label="Ações rápidas"
          onClick={() => setFabOpen((v) => !v)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-blue text-white shadow-[0_18px_55px_rgba(124,58,237,0.45)] ring-4 ring-white/80 dark:ring-slate-950"
          whileTap={{ scale: 0.96 }}
        >
          <Plus className="h-7 w-7" />
        </motion.button>
      </div>
    </div>
  )
}

function FabAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-extrabold text-ink transition hover:bg-[#F8FAFC]"
    >
      {label}
      <ChevronDown className="h-4 w-4 -rotate-90 text-[#64748B]" />
    </button>
  )
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-4 text-center text-sm font-semibold text-[#64748B]">
      {text}
    </div>
  )
}

function KpiCard({
  title,
  value,
  hint,
  icon,
  accent,
  actionLabel,
  onAction,
}: {
  title: string
  value: string
  hint: string
  icon: ReactNode
  accent: 'purple' | 'blue' | 'teal' | 'orange'
  actionLabel?: string
  onAction?: () => void
}) {
  const ring =
    accent === 'purple'
      ? 'from-brand-purple/15 to-brand-teal/10'
      : accent === 'blue'
        ? 'from-brand-blue/15 to-brand-purple/10'
        : accent === 'teal'
          ? 'from-brand-teal/15 to-brand-blue/10'
          : 'from-orange-500/15 to-amber-500/10'

  const interactive = Boolean(onAction)
  const a11yProps = interactive
    ? {
        role: 'button' as const,
        tabIndex: 0 as const,
        onClick: () => onAction?.(),
        onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onAction?.()
          }
        },
      }
    : {}

  return (
    <Card
      padding="md"
      className={`relative overflow-hidden border-[#E2E8F0] bg-white shadow-sm ${
        interactive ? 'cursor-pointer transition hover:border-brand-purple/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/35' : ''
      }`}
      {...a11yProps}
    >
      <div className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${ring} opacity-70 blur-2xl`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-extrabold text-[#64748B]">{title}</div>
          <div className="mt-2 text-2xl font-black tracking-tight">{value}</div>
          <div className="mt-1 text-[11px] font-semibold text-[#64748B]">{hint}</div>
          {actionLabel && onAction ? (
            <div className="mt-3 text-xs font-extrabold text-brand-purple">{actionLabel} →</div>
          ) : null}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0]">{icon}</div>
      </div>
    </Card>
  )
}

function MiniStat({
  title,
  value,
  hint,
  icon,
  actionLabel,
  onAction,
}: {
  title: string
  value: string
  hint: string
  icon: ReactNode
  actionLabel?: string
  onAction?: () => void
}) {
  const interactive = Boolean(onAction)
  const a11yProps = interactive
    ? {
        role: 'button' as const,
        tabIndex: 0 as const,
        onClick: () => onAction?.(),
        onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onAction?.()
          }
        },
      }
    : {}

  return (
    <Card
      padding="md"
      className={`border-[#E2E8F0] bg-white shadow-sm ${
        interactive ? 'cursor-pointer transition hover:border-brand-purple/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/35' : ''
      }`}
      {...a11yProps}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-extrabold text-[#64748B]">{title}</div>
          <div className="mt-2 text-xl font-black tracking-tight">{value}</div>
          <div className="mt-1 text-[11px] font-semibold text-[#64748B]">{hint}</div>
          {actionLabel && onAction ? (
            <div className="mt-3 text-xs font-extrabold text-brand-purple">{actionLabel} →</div>
          ) : null}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0]">{icon}</div>
      </div>
    </Card>
  )
}

function AppointmentRow({
  a,
  onChat,
  onEdit,
  onMore,
}: {
  a: AppointmentWithRelations
  onChat: () => void
  onEdit: () => void
  onMore: () => void
}) {
  const petLabel = [a.pet_name, a.pet_breed].filter(Boolean).join(' · ')
  return (
    <tr className="bg-[#F8FAFC] text-sm font-semibold text-[#0F172A] shadow-sm ring-1 ring-[#E2E8F0] [&>td]:rounded-2xl [&>td]:py-3">
      <td className="px-2 font-extrabold text-brand-purple">{formatTime(a.scheduled_at)}</td>
      <td className="px-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white ring-1 ring-[#E2E8F0]">
            <span className="text-xs font-black text-brand-purple">{(a.pet_name ?? 'P').slice(0, 1).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <div className="truncate font-extrabold">{a.pet_name ?? 'Pet'}</div>
            <div className="truncate text-xs font-semibold text-[#64748B]">{petLabel}</div>
          </div>
        </div>
      </td>
      <td className="px-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white ring-1 ring-[#E2E8F0]">
            <span className="text-xs font-black text-brand-blue">{(a.client_name ?? 'T').slice(0, 1).toUpperCase()}</span>
          </div>
          <div className="truncate font-extrabold">{a.client_name ?? 'Tutor'}</div>
        </div>
      </td>
      <td className="px-2 capitalize text-[#64748B]">{a.service_type}</td>
      <td className="px-2 text-[#64748B]">{a.veterinarian_name ?? '—'}</td>
      <td className="px-2">{statusBadge(a.status)}</td>
      <td className="px-2">
        <div className="flex justify-end gap-1">
          <button type="button" className="rounded-xl p-2 text-[#64748B] transition hover:bg-white hover:text-brand-purple" onClick={onChat} aria-label="Abrir conversa">
            <MessageCircle className="h-4 w-4" />
          </button>
          <button type="button" className="rounded-xl p-2 text-[#64748B] transition hover:bg-white hover:text-brand-purple" onClick={onEdit} aria-label="Editar consulta">
            <Pencil className="h-4 w-4" />
          </button>
          <button type="button" className="rounded-xl p-2 text-[#64748B] transition hover:bg-white hover:text-brand-purple" onClick={onMore} aria-label="Mais opções">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}
