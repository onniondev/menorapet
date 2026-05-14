import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export function usePetviaAdmin() {
  const { session, initialized } = useAuth()
  const uid = session?.user.id

  return useQuery({
    queryKey: ['petvia-admin', uid],
    enabled: Boolean(initialized && uid && isSupabaseConfigured && supabase),
    queryFn: async () => {
      const { data, error } = await supabase!.from('petvia_admins').select('user_id').eq('user_id', uid!).maybeSingle()
      if (error) throw new Error(error.message)
      return Boolean(data)
    },
  })
}
