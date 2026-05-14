export type DashboardPeriod = 'today' | '7d' | '30d' | 'month'

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type MessageDirection = 'inbound' | 'outbound'

export type Client = {
  id: string
  clinic_id: string
  name: string
  phone: string | null
  email: string | null
  created_at: string
}

export type Pet = {
  id: string
  clinic_id: string
  client_id: string
  name: string
  species: string | null
  breed: string | null
  birth_date: string | null
  photo_url: string | null
  created_at: string
}

export type Appointment = {
  id: string
  clinic_id: string
  pet_id: string
  client_id: string
  veterinarian_id: string | null
  service_type: string
  scheduled_at: string
  status: AppointmentStatus
  notes: string | null
  created_at: string
}

export type AppointmentWithRelations = Appointment & {
  pet_name: string | null
  pet_breed: string | null
  pet_species: string | null
  client_name: string | null
  veterinarian_name: string | null
}

export type Message = {
  id: string
  clinic_id: string
  client_id: string | null
  pet_id: string | null
  channel: string
  direction: MessageDirection
  content: string
  status: string
  is_read: boolean
  created_at: string
}

export type MessageWithClient = Message & {
  client_name: string | null
}

export type Payment = {
  id: string
  clinic_id: string
  client_id: string | null
  appointment_id: string | null
  amount: number
  status: PaymentStatus
  payment_method: string | null
  paid_at: string | null
  created_at: string
}

export type Reminder = {
  id: string
  clinic_id: string
  pet_id: string | null
  client_id: string | null
  type: string
  title: string
  due_at: string
  status: string
  created_at: string
}

export type Automation = {
  id: string
  clinic_id: string
  name: string
  type: string
  status: string
  executions_count: number
  created_at: string
}

export type AiInsight = {
  id: string
  clinic_id: string
  title: string
  description: string | null
  type: string
  priority: string
  status: string
  created_at: string
}

export type AttendanceSeriesPoint = {
  day: string
  label: string
  consultas: number
  vacinas: number
  exames: number
}

export type ServiceMixSlice = {
  service_type: string
  count: number
  fill: string
}

export type DashboardMetrics = {
  appointmentsToday: number
  appointmentsTodayDeltaPct: number | null
  pendencias: number
  retornosProximos7d: number
  revenueMonthCents: number
  revenueMonthDeltaPct: number | null
  activeClients90d: number
  inactiveClients90d: number
  unreadMessages: number
  returnRateMonthPct: number | null
  avgTicketCents: number | null
  satisfactionScore: number | null
  satisfactionReviews: number | null
  messagesUsedMonth: number
  messagesQuota: number
  attendanceSeries: AttendanceSeriesPoint[]
  serviceMixMonth: ServiceMixSlice[]
}
