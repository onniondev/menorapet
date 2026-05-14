import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Clinic } from '../types/app'

export function useMyClinics() {
  const { session } = useAuth()
  const uid = session?.user.id

  return useQuery({
    queryKey: ['my-clinics', uid],
    enabled: Boolean(uid && supabase),
    queryFn: async (): Promise<Clinic[]> => {
      const sb = supabase!
      const { data: members, error: e1 } = await sb
        .from('clinic_members')
        .select('clinic_id')
        .eq('user_id', uid!)
        .eq('status', 'active')
      if (e1) throw e1
      const ids = (members ?? []).map((m) => m.clinic_id as string).filter(Boolean)
      if (ids.length === 0) return []
      const { data: clinics, error: e2 } = await sb.from('clinics').select('*').in('id', ids)
      if (e2) throw e2
      return (clinics ?? []) as Clinic[]
    },
  })
}
