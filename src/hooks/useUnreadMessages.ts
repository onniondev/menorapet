import { useQuery } from '@tanstack/react-query'
import { mockUnreadMessages } from '../data/dashboardMock'
import { isSupabaseConfigured } from '../lib/supabase'
import { fetchUnreadMessagesPreview } from '../services/messageService'

export function useUnreadMessages(clinicId: string | null, limit = 6) {
  return useQuery({
    queryKey: ['dashboard-unread-messages', clinicId, limit],
    enabled: Boolean(clinicId),
    staleTime: 20_000,
    queryFn: async () => {
      if (!isSupabaseConfigured) return mockUnreadMessages()
      return fetchUnreadMessagesPreview(clinicId!, limit)
    },
  })
}
