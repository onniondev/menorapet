import { supabase } from '../lib/supabase'
import { endOfMonthLocal, localDayRangeISO, startOfMonthLocal } from '../lib/dateBounds'

function sb() {
  if (!supabase) throw new Error('Supabase não configurado')
  return supabase
}

export async function sumPaidInMonth(clinicId: string, ref = new Date()): Promise<{ totalCents: number; paidCount: number }> {
  const { startIso } = localDayRangeISO(startOfMonthLocal(ref))
  const { endIso } = localDayRangeISO(endOfMonthLocal(ref))
  const { data, error } = await sb()
    .from('payments')
    .select('amount')
    .eq('clinic_id', clinicId)
    .eq('status', 'paid')
    .gte('paid_at', startIso)
    .lte('paid_at', endIso)
  if (error) throw error
  let total = 0
  for (const row of data ?? []) {
    const amt = Number((row as { amount: string | number }).amount)
    if (!Number.isNaN(amt)) total += amt
  }
  return { totalCents: Math.round(total * 100), paidCount: (data ?? []).length }
}

export async function sumPaidInPreviousMonth(clinicId: string, ref = new Date()): Promise<number> {
  const prev = new Date(ref.getFullYear(), ref.getMonth() - 1, 15)
  const { startIso } = localDayRangeISO(startOfMonthLocal(prev))
  const { endIso } = localDayRangeISO(endOfMonthLocal(prev))
  const { data, error } = await sb()
    .from('payments')
    .select('amount')
    .eq('clinic_id', clinicId)
    .eq('status', 'paid')
    .gte('paid_at', startIso)
    .lte('paid_at', endIso)
  if (error) throw error
  let total = 0
  for (const row of data ?? []) {
    const amt = Number((row as { amount: string | number }).amount)
    if (!Number.isNaN(amt)) total += amt
  }
  return Math.round(total * 100)
}

export async function countPendingPayments(clinicId: string): Promise<number> {
  const { count, error } = await sb()
    .from('payments')
    .select('id', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .eq('status', 'pending')
  if (error) throw error
  return count ?? 0
}
