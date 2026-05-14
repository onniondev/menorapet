export type Profile = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type Clinic = {
  id: string
  name: string
  /** Plano comercial exibido no dashboard (coluna opcional no Supabase). */
  plan?: string | null
  slug: string
  phone: string | null
  whatsapp_number: string | null
  email: string | null
  logo_url: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string
  timezone: string
  opening_hours: string | null
  vet_count: number | null
  main_services: string | null
  created_at: string
  updated_at: string
}

export type ClinicMemberRole = 'owner' | 'admin' | 'veterinarian' | 'receptionist' | 'assistant'

export type ClinicMember = {
  id: string
  clinic_id: string
  user_id: string
  role: ClinicMemberRole
  status: string
  created_at: string
}
