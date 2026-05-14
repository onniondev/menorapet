import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useCurrentClinic } from './useCurrentClinic'
import type { ClinicMemberRole } from '../types/app'

export function useClinicContext() {
  const { session } = useAuth()
  const uid = session?.user.id
  const { clinic, clinics, isLoading } = useCurrentClinic()

  const { data: memberRole } = useQuery({
    queryKey: ['my-clinic-role', clinic?.id, uid],
    enabled: Boolean(supabase && clinic?.id && uid),
    staleTime: 120_000,
    queryFn: async (): Promise<ClinicMemberRole | null> => {
      const { data, error } = await supabase!
        .from('clinic_members')
        .select('role')
        .eq('clinic_id', clinic!.id)
        .eq('user_id', uid!)
        .eq('status', 'active')
        .maybeSingle()
      if (error) throw error
      return (data?.role as ClinicMemberRole | undefined) ?? null
    },
  })

  return {
    clinic,
    clinics,
    clinicId: clinic?.id ?? null,
    isLoading,
    memberRole,
  }
}
