import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useClinicContext } from '../hooks/useClinicContext'
import { isSupabaseConfigured } from '../lib/supabase'
import * as inventoryService from '../services/inventoryService'
import type { InventoryItem } from '../types/domain'

export default function EstoquePage() {
  const { clinicId } = useClinicContext()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<InventoryItem | null>(null)
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [qty, setQty] = useState('0')
  const [unit, setUnit] = useState('un')
  const [minq, setMinq] = useState('0')
  const [cat, setCat] = useState('')

  const listQ = useQuery({
    queryKey: ['inventory', clinicId],
    enabled: Boolean(clinicId && isSupabaseConfigured),
    queryFn: () => inventoryService.listInventory(clinicId!),
  })

  const saveM = useMutation({
    mutationFn: async () => {
      const qn = Number(qty)
      const mn = Number(minq)
      if (edit) {
        await inventoryService.updateInventoryItem(edit.id, {
          name,
          sku,
          quantity: Number.isNaN(qn) ? 0 : qn,
          unit,
          min_quantity: Number.isNaN(mn) ? 0 : mn,
          category: cat || null,
        })
      } else {
        await inventoryService.createInventoryItem(clinicId!, {
          name,
          sku: sku || undefined,
          quantity: Number.isNaN(qn) ? 0 : qn,
          unit,
          min_quantity: Number.isNaN(mn) ? 0 : mn,
          category: cat || undefined,
        })
      }
    },
    onSuccess: () => {
      toast.success(edit ? 'Item atualizado.' : 'Item cadastrado.')
      void qc.invalidateQueries({ queryKey: ['inventory', clinicId] })
      setOpen(false)
      setEdit(null)
    },
    onError: (e: Error) => toast.error(e.message.includes('inventory') ? 'Execute a migração de estoque no Supabase (inventory_items).' : e.message),
  })

  const delM = useMutation({
    mutationFn: (id: string) => inventoryService.deleteInventoryItem(id),
    onSuccess: () => {
      toast.success('Item removido.')
      void qc.invalidateQueries({ queryKey: ['inventory', clinicId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  function openCreate() {
    setEdit(null)
    setName('')
    setSku('')
    setQty('0')
    setUnit('un')
    setMinq('0')
    setCat('')
    setOpen(true)
  }

  function openEdit(i: InventoryItem) {
    setEdit(i)
    setName(i.name)
    setSku(i.sku ?? '')
    setQty(String(i.quantity))
    setUnit(i.unit)
    setMinq(String(i.min_quantity))
    setCat(i.category ?? '')
    setOpen(true)
  }

  if (!isSupabaseConfigured) return <Card padding="lg">Configure o Supabase para o estoque.</Card>
  if (!clinicId) return null

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Estoque</h2>
          <p className="mt-1 text-sm text-slate-600">Itens e quantidades · tabela inventory_items</p>
        </div>
        <Button type="button" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Novo item
        </Button>
      </div>

      {listQ.isError ? (
        <Card padding="md" className="border-amber-200 bg-amber-50 text-sm font-semibold text-amber-950">
          Não foi possível carregar o estoque. Aplique a migração <code className="rounded bg-white px-1">20260216100000_inventory_items.sql</code> no Supabase.
        </Card>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-extrabold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Qtd</th>
              <th className="px-4 py-3">Mín.</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(listQ.data ?? []).map((i) => (
              <tr key={i.id} className={i.quantity <= i.min_quantity ? 'bg-amber-50/80' : ''}>
                <td className="px-4 py-3 font-semibold">{i.name}</td>
                <td className="px-4 py-3 text-slate-600">{i.sku ?? '—'}</td>
                <td className="px-4 py-3">
                  {i.quantity} {i.unit}
                </td>
                <td className="px-4 py-3">{i.min_quantity}</td>
                <td className="px-4 py-3 text-slate-600">{i.category ?? '—'}</td>
                <td className="px-4 py-3 text-right">
                  <Button type="button" size="sm" variant="outline" leftIcon={<Pencil className="h-3.5 w-3.5" />} onClick={() => openEdit(i)} />
                  <Button type="button" size="sm" variant="outline" className="ml-2" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => delM.mutate(i.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/50 p-4 pt-16 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xl">
            <h3 className="text-lg font-extrabold">{edit ? 'Editar item' : 'Novo item'}</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <Input label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
              <Input label="Categoria" value={cat} onChange={(e) => setCat(e.target.value)} />
              <Input label="Quantidade" value={qty} onChange={(e) => setQty(e.target.value)} />
              <Input label="Unidade" value={unit} onChange={(e) => setUnit(e.target.value)} />
              <Input label="Estoque mínimo" value={minq} onChange={(e) => setMinq(e.target.value)} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setEdit(null) }}>
                Cancelar
              </Button>
              <Button type="button" loading={saveM.isPending} onClick={() => { if (!name.trim()) { toast.error('Nome obrigatório'); return }; saveM.mutate() }}>
                Salvar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
