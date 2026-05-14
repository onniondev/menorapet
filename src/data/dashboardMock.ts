import { eachLocalDayInclusive, formatDayLabel, periodChartRange } from '../lib/dateBounds'
import type { AiInsight, AppointmentWithRelations, DashboardMetrics, DashboardPeriod, MessageWithClient, Reminder } from '../types/domain'

const DONUT = [
  { service_type: 'consulta', count: 58, fill: '#7C3AED' },
  { service_type: 'vacina', count: 38, fill: '#3B82F6' },
  { service_type: 'exame', count: 22, fill: '#22D3C5' },
  { service_type: 'retorno', count: 14, fill: '#F97316' },
]

export function mockDashboardMetrics(period: DashboardPeriod): DashboardMetrics {
  const { from, to } = periodChartRange(period, new Date())
  const days = eachLocalDayInclusive(from, to)
  const attendanceSeries = days.map((d, i) => ({
    day: d.toDateString(),
    label: formatDayLabel(d),
    consultas: 8 + (i % 5) * 3,
    vacinas: 3 + (i % 4) * 2,
    exames: 2 + (i % 3),
  }))

  return {
    appointmentsToday: 24,
    appointmentsTodayDeltaPct: 20,
    pendencias: 7,
    retornosProximos7d: 13,
    revenueMonthCents: 2_468_000,
    revenueMonthDeltaPct: 18,
    activeClients90d: 1248,
    inactiveClients90d: 23,
    unreadMessages: 12,
    returnRateMonthPct: 68,
    avgTicketCents: 21_530,
    satisfactionScore: 4.9,
    satisfactionReviews: 256,
    messagesUsedMonth: 1280,
    messagesQuota: 2000,
    attendanceSeries,
    serviceMixMonth: DONUT,
  }
}

export function mockTodayAppointments(): AppointmentWithRelations[] {
  return [
    {
      id: '1',
      clinic_id: 'mock',
      pet_id: 'p1',
      client_id: 'c1',
      veterinarian_id: null,
      service_type: 'consulta',
      scheduled_at: new Date().toISOString(),
      status: 'confirmed',
      notes: null,
      created_at: new Date().toISOString(),
      pet_name: 'Thor',
      pet_breed: 'Golden Retriever',
      pet_species: 'Cão',
      client_name: 'Carlos Eduardo',
      veterinarian_name: 'Dra. Juliana',
    },
    {
      id: '2',
      clinic_id: 'mock',
      pet_id: 'p2',
      client_id: 'c2',
      veterinarian_id: null,
      service_type: 'vacina',
      scheduled_at: new Date().toISOString(),
      status: 'confirmed',
      notes: null,
      created_at: new Date().toISOString(),
      pet_name: 'Luna',
      pet_breed: 'SRD',
      pet_species: 'Cão',
      client_name: 'Marina Lopes',
      veterinarian_name: 'Dr. Pedro',
    },
  ]
}

export function mockUnreadMessages(): MessageWithClient[] {
  return [
    {
      id: 'm1',
      clinic_id: 'mock',
      client_id: 'c1',
      pet_id: null,
      channel: 'whatsapp',
      direction: 'inbound',
      content: 'Oi! O Thor ainda está comendo pouco depois da cirurgia…',
      status: 'delivered',
      is_read: false,
      created_at: new Date().toISOString(),
      client_name: 'Marina L.',
    },
    {
      id: 'm2',
      clinic_id: 'mock',
      client_id: 'c2',
      pet_id: null,
      channel: 'whatsapp',
      direction: 'inbound',
      content: 'Podemos remarcar a vacina da Luna para sexta?',
      status: 'delivered',
      is_read: false,
      created_at: new Date().toISOString(),
      client_name: 'João P.',
    },
  ]
}

export function mockTodayReminders(): Reminder[] {
  const due1 = new Date()
  due1.setHours(10, 0, 0, 0)
  const due2 = new Date()
  due2.setHours(14, 30, 0, 0)
  return [
    {
      id: 'r1',
      clinic_id: 'mock',
      pet_id: null,
      client_id: null,
      type: 'vacina',
      title: 'Vacina: Thor',
      due_at: due1.toISOString(),
      status: 'pending',
      created_at: new Date().toISOString(),
    },
    {
      id: 'r2',
      clinic_id: 'mock',
      pet_id: null,
      client_id: null,
      type: 'retorno',
      title: 'Retorno: Luna',
      due_at: due2.toISOString(),
      status: 'pending',
      created_at: new Date().toISOString(),
    },
  ]
}

export function mockAiInsights(): AiInsight[] {
  return [
    {
      id: 'i1',
      clinic_id: 'mock',
      title: '3 clientes não responderam',
      description: 'Mensagens aguardando há mais de 24h.',
      type: 'warning',
      priority: 'high',
      status: 'open',
      created_at: new Date().toISOString(),
    },
    {
      id: 'i2',
      clinic_id: 'mock',
      title: '2 vacinas vencem hoje',
      description: 'Agende confirmação automática.',
      type: 'info',
      priority: 'normal',
      status: 'open',
      created_at: new Date().toISOString(),
    },
  ]
}
