import { endOfMonthLocal, localDayRangeISO, startOfMonthLocal } from '../lib/dateBounds'
import { supabase } from '../lib/supabase'

function sb() {
  if (!supabase) throw new Error('Supabase não configurado')
  return supabase
}

export type OperationalReport = {
  appointmentsThisMonth: number
  clientsTotal: number
  petsTotal: number
  paidReaisMonth: number
  pendingPayments: number
  openReminders: number
  unreadMessages: number
}

export async function getOperationalReport(clinicId: string, ref = new Date()): Promise<OperationalReport> {
  const { startIso } = localDayRangeISO(startOfMonthLocal(ref))
  const { endIso } = localDayRangeISO(endOfMonthLocal(ref))

  const [
    apptRes,
    clientsRes,
    petsRes,
    payRows,
    pendingPay,
    remindersRes,
    unreadRes,
  ] = await Promise.all([
    sb().from('appointments').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId).gte('scheduled_at', startIso).lte('scheduled_at', endIso),
    sb().from('clients').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId),
    sb().from('pets').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId),
    sb().from('payments').select('amount, status').eq('clinic_id', clinicId).eq('status', 'paid').gte('paid_at', startIso).lte('paid_at', endIso),
    sb().from('payments').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId).eq('status', 'pending'),
    sb().from('reminders').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId).eq('status', 'pending'),
    sb().from('messages').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId).eq('is_read', false),
  ])

  if (apptRes.error) throw apptRes.error
  if (clientsRes.error) throw clientsRes.error
  if (petsRes.error) throw petsRes.error
  if (payRows.error) throw payRows.error
  if (pendingPay.error) throw pendingPay.error
  if (remindersRes.error) throw remindersRes.error
  if (unreadRes.error) throw unreadRes.error

  let paidReaisMonth = 0
  for (const r of payRows.data ?? []) {
    paidReaisMonth += Number((r as { amount: string | number }).amount)
  }

  return {
    appointmentsThisMonth: apptRes.count ?? 0,
    clientsTotal: clientsRes.count ?? 0,
    petsTotal: petsRes.count ?? 0,
    paidReaisMonth,
    pendingPayments: pendingPay.count ?? 0,
    openReminders: remindersRes.count ?? 0,
    unreadMessages: unreadRes.count ?? 0,
  }
}
