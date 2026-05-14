import { useQuery } from '@tanstack/react-query'
import { mockAiInsights } from '../data/dashboardMock'
import { isSupabaseConfigured } from '../lib/supabase'
import { fetchOpenAiInsights } from '../services/dashboardService'

export function useAiInsights(clinicId: string | null, limit = 8) {
  return useQuery({
    queryKey: ['dashboard-ai-insights', clinicId, limit],
    enabled: Boolean(clinicId),
    staleTime: 60_000,
    queryFn: async () => {
      if (!isSupabaseConfigured) return mockAiInsights()
      return fetchOpenAiInsights(clinicId!, limit)
    },
  })
}
