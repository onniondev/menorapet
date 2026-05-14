import { supabase } from '../lib/supabase'
import {
  addDays,
  eachLocalDayInclusive,
  endOfMonthLocal,
  formatDayLabel,
  localDayRangeISO,
  startOfMonthLocal,
} from '../lib/dateBounds'
import type { Appointment, AppointmentWithRelations, DashboardPeriod } from '../types/domain'

function sb() {
  if (!supabase) throw new Error('Supabase não configurado')
  return supabase
}

export function normalizeServiceCategory(serviceType: string): 'consultas' | 'vacinas' | 'exames' {
  const s = serviceType.trim().toLowerCase()
  if (s === 'vacina' || s.includes('vacina')) return 'vacinas'
  if (s === 'exame' || s.includes('exame')) return 'exames'
  return 'consultas'
}

export async function countAppointmentsToday(clinicId: string): Promise<number> {
  const { startIso, endIso } = localDayRangeISO()
  const { count, error } = await sb()
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .gte('scheduled_at', startIso)
    .lte('scheduled_at', endIso)
  if (error) throw error
  return count ?? 0
}

export async function countAppointmentsOnLocalDay(clinicId: string, day: Date): Promise<number> {
  const { startIso, endIso } = localDayRangeISO(day)
  const { count, error } = await sb()
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .gte('scheduled_at', startIso)
    .lte('scheduled_at', endIso)
  if (error) throw error
  return count ?? 0
}

export async function countPendingAppointments(clinicId: string): Promise<number> {
  const { count, error } = await sb()
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .eq('status', 'pending')
  if (error) throw error
  return count ?? 0
}

export async function countRetornosNext7Days(clinicId: string): Promise<number> {
  const now = new Date()
  const { startIso } = localDayRangeISO(now)
  const end = addDays(now, 7)
  const endIso = localDayRangeISO(end).endIso
  const { count, error } = await sb()
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .ilike('service_type', 'retorno')
    .gte('scheduled_at', startIso)
    .lte('scheduled_at', endIso)
  if (error) throw error
  return count ?? 0
}

export async function fetchTodayAppointmentsWithRelations(clinicId: string): Promise<AppointmentWithRelations[]> {
  const { startIso, endIso } = localDayRangeISO()
  const { data: rows, error } = await sb()
    .from('appointments')
    .select('id, clinic_id, pet_id, client_id, veterinarian_id, service_type, scheduled_at, status, notes, created_at')
    .eq('clinic_id', clinicId)
    .gte('scheduled_at', startIso)
    .lte('scheduled_at', endIso)
    .order('scheduled_at', { ascending: true })
  if (error) throw error

  const list = (rows ?? []) as Appointment[]
  if (list.length === 0) return []

  const petIds = [...new Set(list.map((a) => a.pet_id))]
  const clientIds = [...new Set(list.map((a) => a.client_id))]
  const vetIds = [...new Set(list.map((a) => a.veterinarian_id).filter(Boolean))] as string[]

  const [petsRes, clientsRes, vetsRes] = await Promise.all([
    sb().from('pets').select('id, name, breed, species').in('id', petIds),
    sb().from('clients').select('id, name').in('id', clientIds),
    vetIds.length ? sb().from('profiles').select('id, full_name').in('id', vetIds) : Promise.resolve({ data: [] as { id: string; full_name: string | null }[], error: null }),
  ])
  if (petsRes.error) throw petsRes.error
  if (clientsRes.error) throw clientsRes.error
  if ('error' in vetsRes && vetsRes.error) throw vetsRes.error

  const petMap = new Map((petsRes.data ?? []).map((p) => [p.id as string, p as { name: string; breed: string | null; species: string | null }]))
  const clientMap = new Map((clientsRes.data ?? []).map((c) => [c.id as string, c as { name: string }]))
  const vetMap = new Map(
    ((('data' in vetsRes ? vetsRes.data : []) ?? []) as { id: string; full_name: string | null }[]).map((v) => [v.id, v.full_name]),
  )

  return list.map((a) => {
    const p = petMap.get(a.pet_id)
    const c = clientMap.get(a.client_id)
    const vn = a.veterinarian_id ? vetMap.get(a.veterinarian_id) : null
    return {
      ...a,
      pet_name: p?.name ?? null,
      pet_breed: p?.breed ?? null,
      pet_species: p?.species ?? null,
      client_name: c?.name ?? null,
      veterinarian_name: vn ?? null,
    }
  })
}

export async function fetchAttendanceSeries(
  clinicId: string,
  period: DashboardPeriod,
): Promise<{ day: string; label: string; consultas: number; vacinas: number; exames: number }[]> {
  const now = new Date()
  let from: Date
  let to: Date
  if (period === 'today') {
    from = new Date(now)
    from.setHours(0, 0, 0, 0)
    to = from
  } else if (period === '7d') {
    to = new Date(now)
    to.setHours(0, 0, 0, 0)
    from = addDays(to, -6)
  } else if (period === '30d') {
    to = new Date(now)
    to.setHours(0, 0, 0, 0)
    from = addDays(to, -29)
  } else {
    from = startOfMonthLocal(now)
    to = new Date(now)
    to.setHours(0, 0, 0, 0)
  }

  const { startIso } = localDayRangeISO(from)
  const { endIso } = localDayRangeISO(to)
  const { data, error } = await sb()
    .from('appointments')
    .select('scheduled_at, service_type')
    .eq('clinic_id', clinicId)
    .gte('scheduled_at', startIso)
    .lte('scheduled_at', endIso)
  if (error) throw error

  const days = eachLocalDayInclusive(from, to)
  const buckets = new Map<string, { consultas: number; vacinas: number; exames: number }>()
  for (const d of days) {
    const key = d.toDateString()
    buckets.set(key, { consultas: 0, vacinas: 0, exames: 0 })
  }

  for (const row of data ?? []) {
    const dt = new Date((row as { scheduled_at: string }).scheduled_at)
    const key = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).toDateString()
    if (!buckets.has(key)) continue
    const cat = normalizeServiceCategory((row as { service_type: string }).service_type)
    const b = buckets.get(key)!
    if (cat === 'vacinas') b.vacinas += 1
    else if (cat === 'exames') b.exames += 1
    else b.consultas += 1
  }

  return days.map((d) => {
    const key = d.toDateString()
    const b = buckets.get(key) ?? { consultas: 0, vacinas: 0, exames: 0 }
    return {
      day: key,
      label: formatDayLabel(d),
      consultas: b.consultas,
      vacinas: b.vacinas,
      exames: b.exames,
    }
  })
}

const DONUT_COLORS = ['#7C3AED', '#3B82F6', '#22D3C5', '#F97316', '#64748B']

export async function fetchServiceMixCurrentMonth(
  clinicId: string,
): Promise<{ service_type: string; count: number; fill: string }[]> {
  const now = new Date()
  const { startIso } = localDayRangeISO(startOfMonthLocal(now))
  const { endIso } = localDayRangeISO(endOfMonthLocal(now))
  const { data, error } = await sb()
    .from('appointments')
    .select('service_type')
    .eq('clinic_id', clinicId)
    .gte('scheduled_at', startIso)
    .lte('scheduled_at', endIso)
  if (error) throw error

  const counts = new Map<string, number>()
  for (const row of data ?? []) {
    const st = String((row as { service_type: string }).service_type || 'outro').trim() || 'outro'
    const key = st.toLowerCase()
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  return sorted.map(([service_type, count], i) => ({
    service_type,
    count,
    fill: DONUT_COLORS[i % DONUT_COLORS.length]!,
  }))
}

export async function monthAppointmentStats(clinicId: string): Promise<{
  total: number
  retornos: number
}> {
  const now = new Date()
  const { startIso } = localDayRangeISO(startOfMonthLocal(now))
  const { endIso } = localDayRangeISO(endOfMonthLocal(now))
  const { data, error } = await sb()
    .from('appointments')
    .select('service_type')
    .eq('clinic_id', clinicId)
    .gte('scheduled_at', startIso)
    .lte('scheduled_at', endIso)
  if (error) throw error
  let retornos = 0
  for (const row of data ?? []) {
    const st = String((row as { service_type: string }).service_type).toLowerCase()
    if (st === 'retorno' || st.includes('retorno')) retornos += 1
  }
  return { total: (data ?? []).length, retornos }
}

export async function distinctClientIdsWithAppointmentSince(
  clinicId: string,
  sinceIso: string,
): Promise<Set<string>> {
  const { data, error } = await sb()
    .from('appointments')
    .select('client_id')
    .eq('clinic_id', clinicId)
    .gte('scheduled_at', sinceIso)
  if (error) throw error
  return new Set((data ?? []).map((r) => (r as { client_id: string }).client_id).filter(Boolean))
}
