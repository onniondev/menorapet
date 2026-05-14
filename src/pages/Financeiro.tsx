import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useClinicContext } from '../hooks/useClinicContext'
import { isSupabaseConfigured } from '../lib/supabase'
import * as clientService from '../services/clientService'
import * as paymentService from '../services/paymentService'

export default function Financeiro() {
  const { clinicId } = useClinicContext()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [clientId, setClientId] = useState('')
  const [status, setStatus] = useState<'pending' | 'paid'>('pending')

  const payQ = useQuery({
    queryKey: ['payments', clinicId],
    enabled: Boolean(clinicId && isSupabaseConfigured),
    queryFn: () => paymentService.listPayments(clinicId!),
  })

  const clientsQ = useQuery({
    queryKey: ['clients', clinicId, 'fin'],
    enabled: Boolean(clinicId && isSupabaseConfigured && open),
    queryFn: () => clientService.listClients(clinicId!),
  })

  const createM = useMutation({
    mutationFn: () =>
      paymentService.createPayment(clinicId!, {
        amount: Number(amount.replace(',', '.')),
        status,
        client_id: clientId || null,
        paid_at: status === 'paid' ? new Date().toISOString() : null,
        payment_method: status === 'paid' ? 'pix' : null,
      }),
    onSuccess: () => {
      toast.success('Lançamento criado.')
      void qc.invalidateQueries({ queryKey: ['payments', clinicId] })
      void qc.invalidateQueries({ queryKey: ['dashboard-metrics', clinicId] })
      setOpen(false)
      setAmount('')
      setClientId('')
      setStatus('pending')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const markM = useMutation({
    mutationFn: ({ id, paid }: { id: string; paid: boolean }) =>
      paymentService.updatePayment(id, {
        status: paid ? 'paid' : 'pending',
        paid_at: paid ? new Date().toISOString() : null,
        payment_method: paid ? 'pix' : null,
      }),
    onSuccess: () => {
      toast.success('Pagamento atualizado.')
      void qc.invalidateQueries({ queryKey: ['payments', clinicId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (!isSupabaseConfigured) return <Card padding="lg">Configure o Supabase.</Card>
  if (!clinicId) return null

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Financeiro</h2>
          <p className="mt-1 text-sm text-slate-600">Cobranças e recebimentos</p>
        </div>
        <Button type="button" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>
          Novo lançamento
        </Button>
      </div>

      <Card padding="none" className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-extrabold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Pago em</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(payQ.data ?? []).map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-bold">{p.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td className="px-4 py-3">
                  <Badge tone={p.status === 'paid' ? 'success' : 'amber'}>{p.status}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-600">{p.paid_at ? new Date(p.paid_at).toLocaleString('pt-BR') : '—'}</td>
                <td className="px-4 py-3 text-right">
                  {p.status !== 'paid' ? (
                    <Button type="button" size="sm" variant="outline" onClick={() => markM.mutate({ id: p.id, paid: true })}>
                      Marcar pago
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/50 p-4 pt-16 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-xl">
            <h3 className="text-lg font-extrabold">Novo lançamento</h3>
            <div className="mt-4 space-y-3">
              <Input label="Valor (R$)" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="120,50" />
              <label className="block text-sm font-semibold">
                Cliente (opcional)
                <select className="mt-1 w-full rounded-2xl border px-3 py-2 text-sm" value={clientId} onChange={(e) => setClientId(e.target.value)}>
                  <option value="">—</option>
                  {(clientsQ.data ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Status inicial
                <select className="mt-1 w-full rounded-2xl border px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value as 'pending' | 'paid')}>
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                </select>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                loading={createM.isPending}
                onClick={() => {
                  const n = Number(amount.replace(',', '.'))
                  if (!amount.trim() || Number.isNaN(n)) {
                    toast.error('Informe um valor válido.')
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
