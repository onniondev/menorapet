import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Calendar, Pencil } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useClinicContext } from '../hooks/useClinicContext'
import { isSupabaseConfigured } from '../lib/supabase'
import * as appointmentService from '../services/appointmentService'
import * as petService from '../services/petService'
import type { PetWithOwner } from '../services/petService'
import type { Appointment } from '../types/domain'

const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type PetDetalheLoadedProps = {
  pet: PetWithOwner
  appointments: Appointment[]
  clinicId: string
  petId: string
}

function PetDetalheLoaded({ pet, appointments, clinicId, petId }: PetDetalheLoadedProps) {
  const qc = useQueryClient()
  const [edit, setEdit] = useState(false)
  const [name, setName] = useState(pet.name)
  const [species, setSpecies] = useState(pet.species ?? '')
  const [breed, setBreed] = useState(pet.breed ?? '')

  const saveM = useMutation({
    mutationFn: () => petService.updatePet(petId, { name, species, breed }),
    onSuccess: () => {
      toast.success('Pet atualizado.')
      void qc.invalidateQueries({ queryKey: ['pet', clinicId, petId] })
      void qc.invalidateQueries({ queryKey: ['pets', clinicId] })
      setEdit(false)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/app/pets" className="inline-flex items-center gap-2 text-sm font-extrabold text-brand-purple hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <Button type="button" variant="outline" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => setEdit((v) => !v)}>
          {edit ? 'Cancelar edição' : 'Editar dados'}
        </Button>
      </div>

      <Card padding="lg" className="border-[#E2E8F0] shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-purple to-brand-blue text-3xl font-black text-white">
            {pet.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            {edit ? (
              <div className="space-y-3">
                <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="Espécie" value={species} onChange={(e) => setSpecies(e.target.value)} />
                <Input label="Raça" value={breed} onChange={(e) => setBreed(e.target.value)} />
                <Button type="button" loading={saveM.isPending} onClick={() => saveM.mutate()}>
                  Salvar
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-black tracking-tight">{pet.name}</h1>
                <p className="mt-1 text-slate-600">{[pet.species, pet.breed].filter(Boolean).join(' · ') || '—'}</p>
                <p className="mt-2 text-sm font-semibold text-slate-500">Tutor: {pet.client_name ?? '—'}</p>
              </>
            )}
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <div className="flex items-center gap-2 text-sm font-extrabold">
          <Calendar className="h-4 w-4 text-brand-purple" />
          Últimas consultas
        </div>
        <ul className="mt-4 space-y-2">
          {appointments.length === 0 ? (
            <li className="text-sm text-slate-500">Nenhuma consulta registrada.</li>
          ) : (
            appointments.map((a) => (
              <li key={a.id} className="flex flex-wrap justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                <span className="font-bold text-brand-purple">{new Date(a.scheduled_at).toLocaleString('pt-BR')}</span>
                <span className="capitalize text-slate-600">{a.service_type}</span>
                <Badge tone="neutral">{a.status}</Badge>
              </li>
            ))
          )}
        </ul>
      </Card>
    </div>
  )
}

export default function PacienteDetalhe() {
  const { id } = useParams()
  const { clinicId } = useClinicContext()

  const validId = Boolean(id && uuidRe.test(id))

  const petQ = useQuery({
    queryKey: ['pet', clinicId, id],
    enabled: Boolean(clinicId && validId && isSupabaseConfigured),
    queryFn: () => petService.getPet(clinicId!, id!),
  })

  const apptQ = useQuery({
    queryKey: ['pet-appts', clinicId, id],
    enabled: Boolean(clinicId && validId && isSupabaseConfigured),
    queryFn: () => appointmentService.listAppointmentsForPet(clinicId!, id!),
  })

  if (!isSupabaseConfigured) {
    return <Card padding="lg">Configure o Supabase.</Card>
  }
  if (!validId) {
    return (
      <Card padding="lg">
        ID inválido.{' '}
        <Link to="/app/pets" className="font-bold text-brand-purple">
          Voltar
        </Link>
      </Card>
    )
  }

  if (petQ.isLoading) return <div className="text-sm text-slate-500">Carregando…</div>
  if (!petQ.data) {
    return (
      <Card padding="lg">
        Pet não encontrado.{' '}
        <Link to="/app/pets" className="font-bold text-brand-purple">
          Voltar
        </Link>
      </Card>
    )
  }

  const p = petQ.data
  const syncKey = `${p.id}|${p.name}|${p.species ?? ''}|${p.breed ?? ''}`

  return <PetDetalheLoaded key={syncKey} pet={p} appointments={apptQ.data ?? []} clinicId={clinicId!} petId={id!} />
}
