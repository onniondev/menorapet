import { useQuery } from '@tanstack/react-query'
import { mockTodayAppointments } from '../data/dashboardMock'
import { isSupabaseConfigured } from '../lib/supabase'
import { fetchTodayAppointmentsWithRelations } from '../services/appointmentService'

export function useTodayAppointments(clinicId: string | null) {
  return useQuery({
    queryKey: ['dashboard-today-appointments', clinicId],
    enabled: Boolean(clinicId),
    staleTime: 30_000,
    queryFn: async () => {
      if (!isSupabaseConfigured) return mockTodayAppointments()
      return fetchTodayAppointmentsWithRelations(clinicId!)
    },
  })
}
