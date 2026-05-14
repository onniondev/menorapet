import { supabase } from '../lib/supabase'

export type ClientSearchRow = { id: string; name: string; phone: string | null; email: string | null }
export type PetSearchRow = {
  id: string
  name: string
  species: string | null
  breed: string | null
  client_id: string | null
}

function ilikePattern(q: string) {
  const trimmed = q.trim().replace(/%/g, '').replace(/_/g, '')
  return `%${trimmed}%`
}

export async function globalSearchClientsAndPets(clinicId: string, q: string): Promise<{ clients: ClientSearchRow[]; pets: PetSearchRow[] }> {
  if (!supabase) throw new Error('Supabase não configurado')
  const pattern = ilikePattern(q)
  if (pattern === '%%') return { clients: [], pets: [] }

  const [clientsRes, petsRes] = await Promise.all([
    supabase.from('clients').select('id, name, phone, email').eq('clinic_id', clinicId).ilike('name', pattern).order('name').limit(25),
    supabase.from('pets').select('id, name, species, breed, client_id').eq('clinic_id', clinicId).ilike('name', pattern).order('name').limit(25),
  ])
  if (clientsRes.error) throw clientsRes.error
  if (petsRes.error) throw petsRes.error

  return {
    clients: (clientsRes.data ?? []) as ClientSearchRow[],
    pets: (petsRes.data ?? []) as PetSearchRow[],
  }
}
