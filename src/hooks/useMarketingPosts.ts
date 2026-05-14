import { useQuery } from '@tanstack/react-query'
import { marketingMockPosts } from '../data/marketingMock'
import { isSupabaseConfigured } from '../lib/supabase'
import * as marketingPostService from '../services/marketingPostService'
import { usePetviaAdmin } from './usePetviaAdmin'

const marketingDemoLocal = import.meta.env.VITE_MARKETING_IA_DEMO === '1' && !isSupabaseConfigured

export function useMarketingPosts() {
  const adminQ = usePetviaAdmin()

  return useQuery({
    queryKey: ['marketing-posts', marketingDemoLocal, adminQ.data],
    enabled: marketingDemoLocal || adminQ.data === true,
    queryFn: async () => {
      if (marketingDemoLocal) return marketingMockPosts
      return marketingPostService.fetchMarketingPosts()
    },
  })
}
