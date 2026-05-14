import { supabase } from '../lib/supabase'
import type { Pet } from '../types/domain'

function sb() {
  if (!supabase) throw new Error('Supabase não configurado')
  return supabase
}

export type PetWithOwner = Pet & { client_name: string | null }

export async function listPetsWithOwners(clinicId: string, search?: string): Promise<PetWithOwner[]> {
  const s = search?.trim()
  const { data: pets, error } = await sb()
    .from('pets')
    .select('id, clinic_id, client_id, name, species, breed, birth_date, photo_url, created_at')
    .eq('clinic_id', clinicId)
    .order('name', { ascending: true })
  if (error) throw error
  let rows = (pets ?? []) as Pet[]
  if (s) {
    const low = s.toLowerCase()
    rows = rows.filter(
      (p) =>
        p.name.toLowerCase().includes(low) ||
        (p.species ?? '').toLowerCase().includes(low) ||
        (p.breed ?? '').toLowerCase().includes(low),
    )
  }
  if (rows.length === 0) return []
  const clientIds = [...new Set(rows.map((p) => p.client_id))]
  const { data: clients, error: e2 } = await sb().from('clients').select('id, name').in('id', clientIds)
  if (e2) throw e2
  const map = new Map((clients ?? []).map((c) => [c.id as string, (c as { name: string }).name]))
  return rows.map((p) => ({ ...p, client_name: map.get(p.client_id) ?? null }))
}

export async function getPet(clinicId: string, petId: string): Promise<PetWithOwner | null> {
  const { data, error } = await sb()
    .from('pets')
    .select('id, clinic_id, client_id, name, species, breed, birth_date, photo_url, created_at')
    .eq('clinic_id', clinicId)
    .eq('id', petId)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const pet = data as Pet
  const { data: c } = await sb().from('clients').select('name').eq('id', pet.client_id).maybeSingle()
  return { ...pet, client_name: (c as { name: string } | null)?.name ?? null }
}

export async function createPet(
  clinicId: string,
  row: Pick<Pet, 'client_id' | 'name'> & Partial<Pick<Pet, 'species' | 'breed' | 'birth_date' | 'photo_url'>>,
): Promise<string> {
  const { data, error } = await sb()
    .from('pets')
    .insert({
      clinic_id: clinicId,
      client_id: row.client_id,
      name: row.name.trim(),
      species: row.species?.trim() || null,
      breed: row.breed?.trim() || null,
      birth_date: row.birth_date || null,
      photo_url: row.photo_url?.trim() || null,
    })
    .select('id')
    .single()
  if (error) throw error
  return (data as { id: string }).id
}

export async function updatePet(id: string, patch: Partial<Pick<Pet, 'client_id' | 'name' | 'species' | 'breed' | 'birth_date' | 'photo_url'>>): Promise<void> {
  const { error } = await sb()
    .from('pets')
    .update({
      ...(patch.client_id != null ? { client_id: patch.client_id } : {}),
      ...(patch.name != null ? { name: patch.name.trim() } : {}),
      ...(patch.species !== undefined ? { species: patch.species?.trim() || null } : {}),
      ...(patch.breed !== undefined ? { breed: patch.breed?.trim() || null } : {}),
      ...(patch.birth_date !== undefined ? { birth_date: patch.birth_date || null } : {}),
      ...(patch.photo_url !== undefined ? { photo_url: patch.photo_url?.trim() || null } : {}),
    })
    .eq('id', id)
  if (error) throw error
}

export async function deletePet(id: string): Promise<void> {
  const { error } = await sb().from('pets').delete().eq('id', id)
  if (error) throw error
}
