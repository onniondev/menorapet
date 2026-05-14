import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { IconButton } from '../components/ui/IconButton'
import { Input } from '../components/ui/Input'
import { useClinicContext } from '../hooks/useClinicContext'
import { addDays, localDayRangeISO } from '../lib/dateBounds'
import { isSupabaseConfigured } from '../lib/supabase'
import * as appointmentService from '../services/appointmentService'
import * as petService from '../services/petService'
import * as teamService from '../services/teamService'
import type { AppointmentStatus, AppointmentWithRelations } from '../types/domain'

function mondayOf(d: Date) {
  const x = new Date(d)
  const day = x.getDay()
  const diff = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + diff)
  x.setHours(0, 0, 0, 0)
  return x
}

export default function Agenda() {
  const { clinicId } = useClinicContext()
  const qc = useQueryClient()
  const [weekAnchor, setWeekAnchor] = useState(() => new Date())
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AppointmentWithRelations | null>(null)
  const [petId, setPetId] = useState('')
  const [clientId, setClientId] = useState('')
  const [serviceType, setServiceType] = useState('consulta')
  const [when, setWhen] = useState('')
  const [status, setStatus] = useState<AppointmentStatus>('confirmed')
  const [vetId, setVetId] = useState('')

  const mon = useMemo(() => mondayOf(weekAnchor), [weekAnchor])
  const range = useMemo(() => {
    const end = addDays(mon, 6)
    end.setHours(23, 59, 59, 999)
    return { startIso: localDayRangeISO(mon).startIso, endIso: localDayRangeISO(end).endIso }
  }, [mon])

  const apptsQ = useQuery({
    queryKey: ['agenda', clinicId, range.startIso, range.endIso],
    enabled: Boolean(clinicId && isSupabaseConfigured),
    queryFn: () => appointmentService.listAppointmentsWithRelationsInRange(clinicId!, range.startIso, range.endIso),
  })

  const petsQ = useQuery({
    queryKey: ['pets', clinicId, 'agenda'],
    enabled: Boolean(clinicId && isSupabaseConfigured && open),
    queryFn: () => petService.listPetsWithOwners(clinicId!),
  })

  const teamQ = useQuery({
    queryKey: ['team', clinicId],
    enabled: Boolean(clinicId && isSupabaseConfigured && open),
    queryFn: () => teamService.listTeamMembers(clinicId!),
  })

  const saveM = useMutation({
    mutationFn: async () => {
      const iso = new Date(when).toISOString()
      if (editing) {
        await appointmentService.updateAppointment(editing.id, {
          pet_id: petId,
          client_id: clientId,
          service_type: serviceType,
          scheduled_at: iso,
          status,
          veterinarian_id: vetId || null,
        })
      } else {
        await appointmentService.createAppointment({
          clinic_id: clinicId!,
          pet_id: petId,
          client_id: clientId,
          veterinarian_id: vetId || null,
          service_type: serviceType,
          scheduled_at: iso,
          status,
        })
      }
    },
    onSuccess: () => {
      toast.success(editing ? 'Consulta atualizada.' : 'Consulta agendada.')
      void qc.invalidateQueries({ queryKey: ['agenda', clinicId] })
      void qc.invalidateQueries({ queryKey: ['dashboard-today-appointments', clinicId] })
      closeModal()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const delM = useMutation({
    mutationFn: (id: string) => appointmentService.deleteAppointment(id),
    onSuccess: () => {
      toast.success('Consulta removida.')
      void qc.invalidateQueries({ queryKey: ['agenda', clinicId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  function closeModal() {
    setOpen(false)
    setEditing(null)
    setPetId('')
    setClientId('')
    setServiceType('consulta')
    setWhen('')
    setStatus('confirmed')
    setVetId('')
  }

  function openCreate() {
    setEditing(null)
    setPetId('')
    setClientId('')
    setServiceType('consulta')
    setWhen('')
    setStatus('confirmed')
    setVetId('')
    setOpen(true)
  }

  function openEdit(a: AppointmentWithRelations) {
    setEditing(a)
    setPetId(a.pet_id)
    setClientId(a.client_id)
    setServiceType(a.service_type)
    const d = new Date(a.scheduled_at)
    const pad = (n: number) => String(n).padStart(2, '0')
    setWhen(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`)
    setStatus(a.status)
    setVetId(a.veterinarian_id ?? '')
    setOpen(true)
  }

  if (!isSupabaseConfigured) return <Card padding="lg">Configure o Supabase para usar a agenda.</Card>
  if (!clinicId) return null

  const vets = (teamQ.data ?? []).filter((m) => ['veterinarian', 'admin', 'owner'].includes(m.role) && m.status === 'active')

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Agenda</h2>
          <p className="mt-1 text-sm text-slate-600">
            Semana de {mon.toLocaleDateString('pt-BR')} a {addDays(mon, 6).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <IconButton label="Semana anterior" onClick={() => setWeekAnchor(addDays(mon, -7))}>
            <ChevronLeft className="h-5 w-5" />
          </IconButton>
          <IconButton label="Próxima semana" onClick={() => setWeekAnchor(addDays(mon, 7))}>
            <ChevronRight className="h-5 w-5" />
          </IconButton>
          <Button type="button" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Novo agendamento
          </Button>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="divide-y divide-slate-100">
          {(apptsQ.data ?? []).map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50">
              <div>
                <div className="text-xs font-extrabold text-brand-purple">{new Date(a.scheduled_at).toLocaleString('pt-BR')}</div>
                <div className="font-extrabold">
                  {a.pet_name} <span className="text-sm font-semibold text-slate-500">· {a.client_name}</span>
                </div>
                <div className="text-xs capitalize text-slate-600">{a.service_type}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="neutral">{a.status}</Badge>
                <Button type="button" size="sm" variant="outline" leftIcon={<Pencil className="h-3.5 w-3.5" />} onClick={() => openEdit(a)} />
                <Button type="button" size="sm" variant="outline" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => { if (confirm('Remover esta consulta?')) delM.mutate(a.id) }} />
              </div>
            </div>
          ))}
        </div>
        {(apptsQ.data ?? []).length === 0 ? <div className="p-8 text-center text-sm text-slate-500">Nenhum agendamento nesta semana.</div> : null}
      </Card>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/50 p-4 pt-12 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xl">
            <h3 className="text-lg font-extrabold">{editing ? 'Editar consulta' : 'Novo agendamento'}</h3>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-semibold">
                Pet
                <select
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  value={petId}
                  onChange={(e) => {
                    const v = e.target.value
                    setPetId(v)
                    const p = (petsQ.data ?? []).find((x) => x.id === v)
                    if (p) setClientId(p.client_id)
                  }}
                >
                  <option value="">Selecione…</option>
                  {(petsQ.data ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.client_name}
                    </option>
                  ))}
                </select>
              </label>
              <Input label="Tipo de serviço" value={serviceType} onChange={(e) => setServiceType(e.target.value)} />
              <Input label="Data e hora" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
              <label className="block text-sm font-semibold">
                Status
                <select className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value as AppointmentStatus)}>
                  {(['pending', 'confirmed', 'completed', 'cancelled', 'no_show'] as const).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Veterinário (opcional)
                <select className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" value={vetId} onChange={(e) => setVetId(e.target.value)}>
                  <option value="">—</option>
                  {vets.map((v) => (
                    <option key={v.user_id} value={v.user_id}>
                      {v.full_name ?? v.email ?? v.user_id}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button
                type="button"
                loading={saveM.isPending}
                onClick={() => {
                  if (!petId || !clientId || !when) {
                    toast.error('Selecione pet, tutor (via pet) e data.')
                    return
                  }
                  saveM.mutate()
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
