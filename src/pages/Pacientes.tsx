import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useClinicContext } from '../hooks/useClinicContext'
import { isSupabaseConfigured } from '../lib/supabase'
import * as clientService from '../services/clientService'
import * as petService from '../services/petService'

export default function Pacientes() {
  const { clinicId } = useClinicContext()
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('')
  const [breed, setBreed] = useState('')
  const [clientId, setClientId] = useState('')

  const petsQ = useQuery({
    queryKey: ['pets', clinicId, q],
    enabled: Boolean(clinicId && isSupabaseConfigured),
    queryFn: () => petService.listPetsWithOwners(clinicId!, q || undefined),
  })

  const clientsQ = useQuery({
    queryKey: ['clients', clinicId, 'all'],
    enabled: Boolean(clinicId && isSupabaseConfigured && open),
    queryFn: () => clientService.listClients(clinicId!),
  })

  const createM = useMutation({
    mutationFn: () => petService.createPet(clinicId!, { client_id: clientId, name, species, breed }),
    onSuccess: () => {
      toast.success('Pet cadastrado.')
      void qc.invalidateQueries({ queryKey: ['pets', clinicId] })
      setOpen(false)
      setName('')
      setSpecies('')
      setBreed('')
      setClientId('')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const delM = useMutation({
    mutationFn: (id: string) => petService.deletePet(id),
    onSuccess: () => {
      toast.success('Pet removido.')
      void qc.invalidateQueries({ queryKey: ['pets', clinicId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (!isSupabaseConfigured) {
    return <Card padding="lg">Configure o Supabase para listar pets.</Card>
  }
  if (!clinicId) return null

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Pets</h2>
          <p className="mt-1 text-sm text-slate-600">Pacientes vinculados aos tutores</p>
        </div>
        <Button type="button" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>
          Novo pet
        </Button>
      </div>

      <div className="max-w-md">
        <Input placeholder="Buscar por nome, espécie ou raça…" left={<Search className="h-4 w-4" />} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(petsQ.data ?? []).map((p) => (
          <Card key={p.id} padding="md" className="border-[#E2E8F0] shadow-sm">
            <div className="text-lg font-extrabold">{p.name}</div>
            <div className="mt-1 text-sm text-slate-600">
              {[p.species, p.breed].filter(Boolean).join(' · ') || '—'}
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-500">Tutor: {p.client_name ?? '—'}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to={`/app/pets/${p.id}`}
                className="inline-flex items-center gap-2 text-sm font-extrabold text-brand-purple hover:underline"
              >
                Ver detalhes
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Button type="button" size="sm" variant="outline" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => { if (confirm('Remover pet?')) delM.mutate(p.id) }}>
                Excluir
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/50 p-4 pt-16 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xl">
            <h3 className="text-lg font-extrabold">Novo pet</h3>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-semibold text-slate-700">
                Tutor
                <select
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                >
                  <option value="">Selecione…</option>
                  {(clientsQ.data ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <Input label="Nome do pet" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Espécie" value={species} onChange={(e) => setSpecies(e.target.value)} placeholder="Cão, gato…" />
              <Input label="Raça" value={breed} onChange={(e) => setBreed(e.target.value)} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                loading={createM.isPending}
                onClick={() => {
                  if (!clientId || !name.trim()) {
                    toast.error('Selecione o tutor e informe o nome do pet.')
                    return
                  }
                  createM.mutate()
                }}
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
