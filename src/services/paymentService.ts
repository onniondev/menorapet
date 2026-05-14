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

export type PaymentRow = {
  id: string
  clinic_id: string
  client_id: string | null
  appointment_id: string | null
  amount: number
  status: string
  payment_method: string | null
  paid_at: string | null
  created_at: string
}

export async function listPayments(clinicId: string, limit = 100): Promise<PaymentRow[]> {
  const { data, error } = await sb()
    .from('payments')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []).map((r) => ({
    ...(r as PaymentRow),
    amount: Number((r as { amount: string | number }).amount),
  }))
}

export async function createPayment(
  clinicId: string,
  row: Pick<PaymentRow, 'amount' | 'status'> & Partial<Pick<PaymentRow, 'client_id' | 'appointment_id' | 'payment_method' | 'paid_at'>>,
): Promise<string> {
  const { data, error } = await sb()
    .from('payments')
    .insert({
      clinic_id: clinicId,
      client_id: row.client_id ?? null,
      appointment_id: row.appointment_id ?? null,
      amount: row.amount,
      status: row.status,
      payment_method: row.payment_method ?? null,
      paid_at: row.paid_at ?? null,
    })
    .select('id')
    .single()
  if (error) throw error
  return (data as { id: string }).id
}

export async function updatePayment(
  id: string,
  patch: Partial<Pick<PaymentRow, 'amount' | 'status' | 'payment_method' | 'paid_at' | 'client_id' | 'appointment_id'>>,
): Promise<void> {
  const { error } = await sb()
    .from('payments')
    .update({
      ...(patch.amount != null ? { amount: patch.amount } : {}),
      ...(patch.status != null ? { status: patch.status } : {}),
      ...(patch.payment_method !== undefined ? { payment_method: patch.payment_method } : {}),
      ...(patch.paid_at !== undefined ? { paid_at: patch.paid_at } : {}),
      ...(patch.client_id !== undefined ? { client_id: patch.client_id } : {}),
      ...(patch.appointment_id !== undefined ? { appointment_id: patch.appointment_id } : {}),
    })
    .eq('id', id)
  if (error) throw error
}
