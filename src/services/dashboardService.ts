import { addDays } from '../lib/dateBounds'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { AiInsight, DashboardMetrics, DashboardPeriod } from '../types/domain'
import {
  countAppointmentsOnLocalDay,
  countAppointmentsToday,
  countPendingAppointments,
  countRetornosNext7Days,
  distinctClientIdsWithAppointmentSince,
  fetchAttendanceSeries,
  fetchServiceMixCurrentMonth,
  monthAppointmentStats,
} from './appointmentService'
import { countMessagesThisMonth, countUnreadMessages, distinctClientIdsWithMessageSince } from './messageService'
import { countPendingPayments, sumPaidInMonth, sumPaidInPreviousMonth } from './paymentService'
import { mockDashboardMetrics } from '../data/dashboardMock'

function messagesQuotaForPlan(plan: string | undefined): number {
  const p = (plan ?? '').toLowerCase()
  if (p.includes('premium')) return 2000
  if (p.includes('pro')) return 1500
  return 800
}

function pctDelta(current: number, previous: number): number | null {
  if (previous <= 0) return current > 0 ? 100 : null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

export async function fetchOpenAiInsights(clinicId: string, limit = 8): Promise<AiInsight[]> {
  if (!supabase) return []
  const priorityRank: Record<string, number> = { critical: 4, high: 3, normal: 2, low: 1 }
  const { data, error } = await supabase
    .from('ai_insights')
    .select('id, clinic_id, title, description, type, priority, status, created_at')
    .eq('clinic_id', clinicId)
    .in('status', ['open'])
    .order('created_at', { ascending: false })
    .limit(40)
  if (error) throw error
  const rows = (data ?? []) as AiInsight[]
  rows.sort((a, b) => (priorityRank[b.priority] ?? 0) - (priorityRank[a.priority] ?? 0))
  return rows.slice(0, limit)
}

export async function updateAiInsightStatus(id: string, status: 'open' | 'dismissed' | 'resolved'): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado')
  const { error } = await supabase.from('ai_insights').update({ status }).eq('id', id)
  if (error) throw error
}

export async function loadDashboardMetrics(
  clinicId: string,
  period: DashboardPeriod,
  clinicPlan?: string | null,
): Promise<DashboardMetrics> {
  if (!isSupabaseConfigured || !supabase) return mockDashboardMetrics(period)

  const now = new Date()
  const since90Iso = addDays(now, -90).toISOString()

  const [
    appointmentsToday,
    yesterdayCount,
    pendingAppts,
    unread,
    pendingPay,
    retornos7,
    paidMonth,
    paidPrevMonthCents,
    apptClients90,
    msgClients90,
    attendanceSeries,
    serviceMixMonth,
    monthStats,
    messagesMonth,
  ] = await Promise.all([
    countAppointmentsToday(clinicId),
    countAppointmentsOnLocalDay(clinicId, addDays(now, -1)),
    countPendingAppointments(clinicId),
    countUnreadMessages(clinicId),
    countPendingPayments(clinicId),
    countRetornosNext7Days(clinicId),
    sumPaidInMonth(clinicId, now),
    sumPaidInPreviousMonth(clinicId, now),
    distinctClientIdsWithAppointmentSince(clinicId, since90Iso),
    distinctClientIdsWithMessageSince(clinicId, since90Iso),
    fetchAttendanceSeries(clinicId, period),
    fetchServiceMixCurrentMonth(clinicId),
    monthAppointmentStats(clinicId),
    countMessagesThisMonth(clinicId),
  ])

  const activeSet = new Set<string>([...apptClients90, ...msgClients90])
  const activeClients90d = activeSet.size

  const { data: allClientRows, error: allClientsErr } = await supabase
    .from('clients')
    .select('id')
    .eq('clinic_id', clinicId)
  if (allClientsErr) throw allClientsErr
  const inactiveClients90d = (allClientRows ?? []).filter((c) => !apptClients90.has((c as { id: string }).id)).length

  const pendencias = pendingAppts + unread + pendingPay
  const returnRateMonthPct =
    monthStats.total > 0 ? Math.round((monthStats.retornos / monthStats.total) * 1000) / 10 : null
  const avgTicketCents =
    paidMonth.paidCount > 0 ? Math.round(paidMonth.totalCents / paidMonth.paidCount) : null

  const quota = messagesQuotaForPlan(clinicPlan ?? undefined)

  return {
    appointmentsToday,
    appointmentsTodayDeltaPct: pctDelta(appointmentsToday, yesterdayCount),
    pendencias,
    retornosProximos7d: retornos7,
    revenueMonthCents: paidMonth.totalCents,
    revenueMonthDeltaPct: pctDelta(paidMonth.totalCents, paidPrevMonthCents),
    activeClients90d,
    inactiveClients90d,
    unreadMessages: unread,
    returnRateMonthPct,
    avgTicketCents,
    satisfactionScore: null,
    satisfactionReviews: null,
    messagesUsedMonth: messagesMonth,
    messagesQuota: quota,
    attendanceSeries,
    serviceMixMonth,
  }
}

export { mockDashboardMetrics }
