import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageCircle, Search, Send } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useClinicContext } from '../hooks/useClinicContext'
import { isSupabaseConfigured } from '../lib/supabase'
import * as messageThreadService from '../services/messageThreadService'

export default function Conversas() {
  const { clinicId } = useClinicContext()
  const qc = useQueryClient()
  const [userPick, setUserPick] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [draft, setDraft] = useState('')

  const threadsQ = useQuery({
    queryKey: ['message-threads', clinicId],
    enabled: Boolean(clinicId && isSupabaseConfigured),
    queryFn: () => messageThreadService.listThreads(clinicId!),
  })

  const filtered = useMemo(() => {
    const list = threadsQ.data ?? []
    const s = q.trim().toLowerCase()
    if (!s) return list
    return list.filter((t) => t.client_name.toLowerCase().includes(s) || t.last_preview.toLowerCase().includes(s))
  }, [threadsQ.data, q])

  const activeClientId = userPick ?? filtered[0]?.client_id ?? null

  const messagesQ = useQuery({
    queryKey: ['messages-thread', clinicId, activeClientId],
    enabled: Boolean(clinicId && activeClientId && isSupabaseConfigured),
    queryFn: () => messageThreadService.listMessagesForClient(clinicId!, activeClientId!),
  })

  const markReadM = useMutation({
    mutationFn: () => messageThreadService.markThreadRead(clinicId!, activeClientId!),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['message-threads', clinicId] }),
  })

  useEffect(() => {
    if (!clinicId || !activeClientId || !isSupabaseConfigured) return
    markReadM.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apenas ao trocar de thread
  }, [clinicId, activeClientId])

  const sendM = useMutation({
    mutationFn: (text: string) => messageThreadService.sendOutboundMessage(clinicId!, activeClientId!, null, text),
    onSuccess: () => {
      setDraft('')
      void qc.invalidateQueries({ queryKey: ['messages-thread', clinicId, activeClientId] })
      void qc.invalidateQueries({ queryKey: ['message-threads', clinicId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const activeThread = useMemo(() => filtered.find((t) => t.client_id === activeClientId), [filtered, activeClientId])

  if (!isSupabaseConfigured) {
    return <Card padding="lg">Configure o Supabase para ver conversas reais na tabela messages.</Card>
  }
  if (!clinicId) return null

  return (
    <div key={clinicId} className="grid gap-4 lg:h-[calc(100dvh-10.5rem)] lg:grid-cols-[minmax(0,320px)_1fr_minmax(0,280px)]">
      <Card className="flex min-h-[280px] flex-col overflow-hidden p-0" padding="none">
        <div className="border-b border-slate-200/70 p-4 dark:border-white/10">
          <div className="text-sm font-extrabold">Conversas</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Por cliente (WhatsApp)</div>
          <div className="mt-3">
            <Input placeholder="Buscar…" left={<Search className="h-4 w-4" />} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <div className="flex-1 overflow-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-slate-500">Nenhuma mensagem ainda. Envie pela API ou registre mensagens inbound.</p>
          ) : (
            filtered.map((t) => (
              <button
                key={t.client_id}
                type="button"
                onClick={() => setUserPick(t.client_id)}
                className={`mb-1 flex w-full items-start gap-3 rounded-3xl p-3 text-left transition ${
                  t.client_id === activeClientId
                    ? 'bg-gradient-to-r from-brand-purple/14 via-brand-blue/10 to-brand-teal/10 ring-1 ring-brand-purple/25 shadow-sm'
                    : 'hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 text-emerald-700 dark:text-emerald-300">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-extrabold">{t.client_name}</div>
                    <div className="shrink-0 text-[11px] font-semibold text-slate-500">
                      {new Date(t.last_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="mt-1 truncate text-xs text-slate-600 dark:text-slate-300">{t.last_preview}</div>
                </div>
                {t.unread ? (
                  <span className="mt-1 inline-flex min-w-6 justify-center rounded-full bg-brand-purple px-2 py-0.5 text-[11px] font-extrabold text-white shadow-lg shadow-brand-purple/25">
                    {t.unread}
                  </span>
                ) : null}
              </button>
            ))
          )}
        </div>
      </Card>

      <Card className="flex min-h-[420px] flex-col overflow-hidden p-0" padding="none">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-4 py-3 dark:border-white/10">
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold">{activeThread?.client_name ?? 'Selecione uma conversa'}</div>
            <div className="truncate text-xs text-slate-500 dark:text-slate-400">Canal WhatsApp</div>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-auto bg-gradient-to-b from-slate-900/[0.02] to-transparent px-3 py-4 dark:from-white/[0.03]">
          {(messagesQ.data ?? []).map((m) => {
            const mine = m.direction === 'outbound'
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[min(92%,520px)] rounded-[1.35rem] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    mine
                      ? 'rounded-br-md bg-gradient-to-br from-brand-purple to-brand-blue text-white shadow-[0_14px_40px_rgba(124,58,237,0.25)]'
                      : 'rounded-bl-md border border-slate-200/75 bg-white/85 text-slate-800 dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-100'
                  }`}
                >
                  <div>{m.content}</div>
                  <div className={`mt-2 text-[11px] font-semibold ${mine ? 'text-white/80' : 'text-slate-500'}`}>
                    {new Date(m.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="border-t border-slate-200/70 p-3 dark:border-white/10">
          <div className="flex items-stretch gap-2">
            <textarea
              className="min-h-11 flex-1 resize-none rounded-2xl border border-slate-200/85 bg-white/75 px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950/40"
              placeholder="Escreva uma mensagem…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={!activeClientId}
            />
            <Button
              type="button"
              size="md"
              className="shrink-0 px-4"
              leftIcon={<Send className="h-4 w-4" />}
              loading={sendM.isPending}
              disabled={!activeClientId || !draft.trim()}
              onClick={() => sendM.mutate(draft)}
            >
              Enviar
            </Button>
          </div>
        </div>
      </Card>

      <Card className="min-h-[280px] lg:min-h-0">
        <div className="text-base font-extrabold tracking-tight">Cliente</div>
        {activeThread ? (
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <div className="text-xs font-semibold text-slate-500">Nome</div>
              <div className="font-bold">{activeThread.client_name}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Não lidas (entrada)</span>
              <Badge tone={activeThread.unread ? 'amber' : 'neutral'}>{activeThread.unread}</Badge>
            </div>
            <Link to="/app/clientes" className="inline-block text-sm font-semibold text-brand-purple hover:underline">
              Ir para clientes
            </Link>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Escolha uma conversa à esquerda.</p>
        )}
      </Card>
    </div>
  )
}
