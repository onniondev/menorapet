import { supabase } from '../lib/supabase'
import type { ClinicMemberRole } from '../types/app'

function sb() {
  if (!supabase) throw new Error('Supabase não configurado')
  return supabase
}

export type TeamMemberRow = {
  id: string
  clinic_id: string
  user_id: string
  role: ClinicMemberRole
  status: string
  full_name: string | null
  email: string | null
}

export async function listTeamMembers(clinicId: string): Promise<TeamMemberRow[]> {
  const { data, error } = await sb()
    .from('clinic_members')
    .select('id, clinic_id, user_id, role, status, profiles(full_name, email)')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: true })
  if (error) throw error
  type Raw = {
    id: string
    clinic_id: string
    user_id: string
    role: ClinicMemberRole
    status: string
    profiles: { full_name: string | null; email: string | null } | { full_name: string | null; email: string | null }[] | null
  }
  return ((data ?? []) as Raw[]).map((r) => {
    const p = Array.isArray(r.profiles) ? r.profiles[0] ?? null : r.profiles
    return {
      id: r.id,
      clinic_id: r.clinic_id,
      user_id: r.user_id,
      role: r.role,
      status: r.status,
      full_name: p?.full_name ?? null,
      email: p?.email ?? null,
    }
  })
}

export type InvitationRow = {
  id: string
  clinic_id: string
  email: string
  role: ClinicMemberRole
  status: string
  expires_at: string
  created_at: string
}

export async function listInvitations(clinicId: string): Promise<InvitationRow[]> {
  const { data, error } = await sb().from('invitations').select('*').eq('clinic_id', clinicId).order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as InvitationRow[]
}

function randomToken() {
  const a = new Uint8Array(24)
  crypto.getRandomValues(a)
  return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function createInvitation(
  clinicId: string,
  email: string,
  role: ClinicMemberRole,
  expiresInDays = 7,
): Promise<void> {
  const token = randomToken()
  const expires = new Date()
  expires.setDate(expires.getDate() + expiresInDays)
  const { error } = await sb().from('invitations').insert({
    clinic_id: clinicId,
    email: email.trim().toLowerCase(),
    role,
    token,
    status: 'pending',
    expires_at: expires.toISOString(),
  })
  if (error) throw error
}

export async function revokeInvitation(id: string): Promise<void> {
  const { error } = await sb().from('invitations').update({ status: 'revoked' }).eq('id', id)
  if (error) throw error
}
