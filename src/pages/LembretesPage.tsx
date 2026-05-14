import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useClinicContext } from '../hooks/useClinicContext'
import { isSupabaseConfigured } from '../lib/supabase'
import * as reminderService from '../services/reminderService'
import type { Reminder } from '../types/domain'

export default function LembretesPage() {
  const { clinicId } = useClinicContext()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('geral')
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')

  const listQ = useQuery({
    queryKey: ['reminders', clinicId],
    enabled: Boolean(clinicId && isSupabaseConfigured),
    queryFn: () => reminderService.listReminders(clinicId!, { limit: 200 }),
  })

  const createM = useMutation({
    mutationFn: () => reminderService.createReminder(clinicId!, { type, title, due_at: new Date(due).toISOString() }),
    onSuccess: () => {
      toast.success('Lembrete criado.')
      void qc.invalidateQueries({ queryKey: ['reminders', clinicId] })
      setOpen(false)
      setTitle('')
      setDue('')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const statusM = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Reminder['status'] }) => reminderService.updateReminder(id, { status }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['reminders', clinicId] }),
    onError: (e: Error) => toast.error(e.message),
  })

  const delM = useMutation({
    mutationFn: (id: string) => reminderService.deleteReminder(id),
    onSuccess: () => {
      toast.success('Removido.')
      void qc.invalidateQueries({ queryKey: ['reminders', clinicId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (!isSupabaseConfigured) {
    return <Card padding="lg">Configure o Supabase para gerenciar lembretes.</Card>
  }
  if (!clinicId) return null

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Lembretes</h2>
          <p className="mt-1 text-sm text-slate-600">Tarefas e alertas da clínica</p>
        </div>
        <Button type="button" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>
          Novo lembrete
        </Button>
      </div>

      <div className="space-y-2">
        {(listQ.data ?? []).map((r) => (
          <Card key={r.id} padding="md" className="flex flex-wrap items-center justify-between gap-3 border-[#E2E8F0] shadow-sm">
            <div>
              <div className="text-xs font-extrabold uppercase text-brand-purple">{r.type}</div>
              <div className="mt-1 font-extrabold">{r.title}</div>
              <div className="mt-1 text-xs text-slate-500">{new Date(r.due_at).toLocaleString('pt-BR')}</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={r.status === 'done' ? 'success' : 'amber'}>{r.status}</Badge>
              {r.status !== 'done' ? (
                <Button type="button" size="sm" variant="outline" onClick={() => statusM.mutate({ id: r.id, status: 'done' })}>
                  Concluir
                </Button>
              ) : null}
              <Button type="button" size="sm" variant="outline" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => delM.mutate(r.id)}>
                Excluir
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/50 p-4 pt-16 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xl">
            <h3 className="text-lg font-extrabold">Novo lembrete</h3>
            <div className="mt-4 space-y-3">
              <Input label="Tipo" value={type} onChange={(e) => setType(e.target.value)} placeholder="vacina, retorno, geral…" />
              <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input label="Data e hora" type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                loading={createM.isPending}
                onClick={() => {
                  if (!title.trim() || !due) {
                    toast.error('Preencha título e data.')
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
