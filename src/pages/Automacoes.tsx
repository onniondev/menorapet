import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Play, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useClinicContext } from '../hooks/useClinicContext'
import { isSupabaseConfigured } from '../lib/supabase'
import * as automationService from '../services/automationService'

export default function Automacoes() {
  const { clinicId } = useClinicContext()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('whatsapp')
  const [desc, setDesc] = useState('')

  const listQ = useQuery({
    queryKey: ['automations', clinicId],
    enabled: Boolean(clinicId && isSupabaseConfigured),
    queryFn: () => automationService.listAutomations(clinicId!),
  })

  const createM = useMutation({
    mutationFn: () => automationService.createAutomation(clinicId!, { name, type, description: desc }),
    onSuccess: () => {
      toast.success('Automação criada.')
      void qc.invalidateQueries({ queryKey: ['automations', clinicId] })
      setOpen(false)
      setName('')
      setDesc('')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const toggleM = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      automationService.updateAutomationStatus(id, active ? 'active' : 'paused'),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['automations', clinicId] }),
    onError: (e: Error) => toast.error(e.message),
  })

  const simM = useMutation({
    mutationFn: (id: string) => automationService.incrementAutomationExecutions(id),
    onSuccess: () => {
      toast.success('Execução registrada.')
      void qc.invalidateQueries({ queryKey: ['automations', clinicId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const delM = useMutation({
    mutationFn: (id: string) => automationService.deleteAutomation(id),
    onSuccess: () => {
      toast.success('Removida.')
      void qc.invalidateQueries({ queryKey: ['automations', clinicId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (!isSupabaseConfigured) return <Card padding="lg">Configure o Supabase.</Card>
  if (!clinicId) return null

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Automações</h2>
          <p className="mt-1 text-sm text-slate-600">Fluxos persistidos na tabela automations</p>
        </div>
        <Button type="button" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>
          Nova automação
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {(listQ.data ?? []).map((f) => (
          <Card key={f.id} padding="md" className="border-[#E2E8F0] shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-extrabold">{f.name}</div>
                <div className="mt-1 text-xs font-semibold uppercase text-slate-500">{f.type}</div>
                {f.description ? <p className="mt-2 text-sm text-slate-600">{f.description}</p> : null}
                <div className="mt-2 text-xs text-slate-500">Execuções: {f.executions_count}</div>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold uppercase text-slate-700">{f.status}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => toggleM.mutate({ id: f.id, active: f.status !== 'active' })}>
                {f.status === 'active' ? 'Pausar' : 'Ativar'}
              </Button>
              <Button type="button" size="sm" variant="outline" leftIcon={<Play className="h-3.5 w-3.5" />} onClick={() => simM.mutate(f.id)}>
                Simular
              </Button>
              <Button type="button" size="sm" variant="outline" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => delM.mutate(f.id)}>
                Excluir
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/50 p-4 pt-16 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-xl">
            <h3 className="text-lg font-extrabold">Nova automação</h3>
            <div className="mt-4 space-y-3">
              <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Tipo (ex.: whatsapp, email, lembrete)" value={type} onChange={(e) => setType(e.target.value)} />
              <Input label="Descrição" value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" loading={createM.isPending} onClick={() => { if (!name.trim()) { toast.error('Informe o nome'); return }; createM.mutate() }}>
                Salvar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
