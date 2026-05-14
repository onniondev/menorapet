import { supabase } from '../lib/supabase'

export type OnboardingPayload = {
  clinicName: string
  phone: string
  whatsapp: string
  email: string
  city: string
  state: string
  openingHours: string
  vetCount: number
  mainServices: string
}

export async function createClinicOnboarding(payload: OnboardingPayload) {
  if (!supabase) throw new Error('Supabase não configurado')

  const { data, error } = await supabase.rpc('create_clinic_onboarding', {
    p_clinic_name: payload.clinicName,
    p_phone: payload.phone,
    p_whatsapp: payload.whatsapp,
    p_email: payload.email,
    p_city: payload.city,
    p_state: payload.state,
    p_opening_hours: payload.openingHours,
    p_vet_count: payload.vetCount,
    p_main_services: payload.mainServices,
  })

  if (error) throw error
  return data as string
}
