import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useClinicContext } from '../hooks/useClinicContext'
import { isSupabaseConfigured } from '../lib/supabase'
import * as clientService from '../services/clientService'
import type { Client } from '../types/domain'

export default function ClientesPage() {
  const { clinicId } = useClinicContext()
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [dialog, setDialog] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Client | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  const listQ = useQuery({
    queryKey: ['clients', clinicId, q],
    enabled: Boolean(clinicId && isSupabaseConfigured),
    queryFn: () => clientService.listClients(clinicId!, q || undefined),
  })

  const createM = useMutation({
    mutationFn: () => clientService.createClient(clinicId!, { name, phone: phone || undefined, email: email || undefined }),
    onSuccess: () => {
      toast.success('Cliente cadastrado.')
      void qc.invalidateQueries({ queryKey: ['clients', clinicId] })
      closeDialog()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateM = useMutation({
    mutationFn: () => clientService.updateClient(editing!.id, { name, phone, email }),
    onSuccess: () => {
      toast.success('Cliente atualizado.')
      void qc.invalidateQueries({ queryKey: ['clients', clinicId] })
      closeDialog()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteM = useMutation({
    mutationFn: (id: string) => clientService.deleteClient(id),
    onSuccess: () => {
      toast.success('Cliente removido.')
      void qc.invalidateQueries({ queryKey: ['clients', clinicId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  function openCreate() {
    setEditing(null)
    setName('')
    setPhone('')
    setEmail('')
    setDialog('create')
  }

  function openEdit(c: Client) {
    setEditing(c)
    setName(c.name)
    setPhone(c.phone ?? '')
    setEmail(c.email ?? '')
    setDialog('edit')
  }

  function closeDialog() {
    setDialog(null)
    setEditing(null)
  }

  if (!isSupabaseConfigured) {
    return (
      <Card padding="lg" className="text-sm font-medium text-slate-600">
        Configure o Supabase no <code className="rounded bg-slate-100 px-1">.env</code> para gerenciar tutores.
      </Card>
    )
  }

  if (!clinicId) return null

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Clientes</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Tutores da clínica · cadastro sincronizado com o banco</p>
        </div>
        <Button type="button" size="md" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Novo cliente
        </Button>
      </div>

      <div className="max-w-md">
        <Input placeholder="Buscar nome, e-mail ou telefone…" left={<Search className="h-4 w-4" />} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {listQ.isLoading ? <div className="text-sm font-semibold text-slate-500">Carregando…</div> : null}
      {listQ.isError ? <div className="text-sm font-semibold text-rose-600">Erro ao carregar clientes.</div> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {(listQ.data ?? []).map((c) => (
          <Card key={c.id} padding="md" className="border-[#E2E8F0] shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-lg font-extrabold">{c.name}</div>
                <div className="mt-1 truncate text-sm text-slate-600 dark:text-slate-400">{c.phone ?? '—'}</div>
                <div className="mt-0.5 truncate text-sm text-slate-600 dark:text-slate-400">{c.email ?? '—'}</div>
              </div>
              <Badge tone="neutral">Ativo</Badge>
            </div>
            <div className="mt-4 flex gap-2">
              <Button type="button" variant="outline" size="sm" leftIcon={<Pencil className="h-3.5 w-3.5" />} onClick={() => openEdit(c)}>
                Editar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                onClick={() => {
                  if (confirm(`Remover ${c.name}? Isso pode falhar se houver pets ou consultas vinculados.`)) deleteM.mutate(c.id)
                }}
              >
                Excluir
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {(listQ.data ?? []).length === 0 && !listQ.isLoading ? (
        <Card padding="lg" className="border-dashed text-center text-sm font-semibold text-slate-500">
          Nenhum cliente encontrado. Cadastre o primeiro tutor.
        </Card>
      ) : null}

      {dialog ? (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 pt-16 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xl">
            <h3 className="text-lg font-extrabold">{dialog === 'create' ? 'Novo cliente' : 'Editar cliente'}</h3>
            <div className="mt-4 space-y-3">
              <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button
                type="button"
                loading={createM.isPending || updateM.isPending}
                onClick={() => {
                  if (!name.trim()) {
                    toast.error('Informe o nome.')
                    return
                  }
                  if (dialog === 'create') createM.mutate()
                  else updateM.mutate()
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
