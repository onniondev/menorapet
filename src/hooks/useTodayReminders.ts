import { useQuery } from '@tanstack/react-query'
import { mockTodayReminders } from '../data/dashboardMock'
import { isSupabaseConfigured } from '../lib/supabase'
import { fetchTodayReminders } from '../services/reminderService'

export function useTodayReminders(clinicId: string | null) {
  return useQuery({
    queryKey: ['dashboard-today-reminders', clinicId],
    enabled: Boolean(clinicId),
    staleTime: 30_000,
    queryFn: async () => {
      if (!isSupabaseConfigured) return mockTodayReminders()
      return fetchTodayReminders(clinicId!)
    },
  })
}
