/** Limites do dia local em ISO (UTC) para filtros no Supabase. */
export function localDayRangeISO(date = new Date()): { startIso: string; endIso: string } {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return { startIso: start.toISOString(), endIso: end.toISOString() }
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function startOfMonthLocal(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
}

export function endOfMonthLocal(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function eachLocalDayInclusive(from: Date, to: Date): Date[] {
  const out: Date[] = []
  const cur = new Date(from)
  cur.setHours(0, 0, 0, 0)
  const end = new Date(to)
  end.setHours(0, 0, 0, 0)
  while (cur <= end) {
    out.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return out
}

export function formatDayLabel(d: Date): string {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

import type { DashboardPeriod } from '../types/domain'

export function periodChartRange(period: DashboardPeriod, now = new Date()): { from: Date; to: Date } {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  if (period === 'today') return { from: today, to: today }
  if (period === '7d') return { from: addDays(today, -6), to: today }
  if (period === '30d') return { from: addDays(today, -29), to: today }
  return { from: startOfMonthLocal(now), to: today }
}
