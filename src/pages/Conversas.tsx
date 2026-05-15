import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bot, MessageCircle, Search, Send, UserCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useClinicContext } from '../hooks/useClinicContext'
import { isSupabaseConfigured } from '../lib/supabase'
import * as messageThreadService from '../services/messageThreadService'
import * as waApi from '../services/whatsappConversationApi'

export default function Conversas() {
  const { clinicId } = useClinicContext()
  const qc = useQueryClient()
  const [pickConvId, setPickConvId] = useState<string | null>(null)
  const [pickClientId, setPickClientId] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [draft, setDraft] = useState('')
  const [onlyUnassigned, setOnlyUnassigned] = useState(false)

  const inboxQ = useQuery({
    queryKey: ['wa-inbox', clinicId, q, onlyUnassigned],
    enabled: Boolean(clinicId),
    queryFn: () =>
      waApi.apiListConversations(clinicId!, {
        q: q.trim() || undefined,
        unassigned: onlyUnassigned || undefined,
      }),
    retry: false,
    refetchInterval: 8000,
  })

  const useWaInbox = inboxQ.isSuccess && !inboxQ.isError

  const threadsQ = useQuery({
    queryKey: ['message-threads', clinicId],
    enabled: Boolean(clinicId && isSupabaseConfigured && !useWaInbox),
    queryFn: () => messageThreadService.listThreads(clinicId!),
  })

  const waConversations = inboxQ.data?.conversations ?? []
  const activeConvId = pickConvId ?? waConversations[0]?.id ?? null

  const convDetailQ = useQuery({
    queryKey: ['wa-conv', clinicId, activeConvId],
    enabled: Boolean(clinicId && activeConvId && useWaInbox),
    queryFn: () => waApi.apiGetConversation(clinicId!, activeConvId!),
    refetchInterval: 5000,
  })

  const legacyFiltered = useMemo(() => {
    const list = threadsQ.data ?? []
    const s = q.trim().toLowerCase()
    if (!s) return list
    return list.filter((t) => t.client_name.toLowerCase().includes(s) || t.last_preview.toLowerCase().includes(s))
  }, [threadsQ.data, q])

  const activeClientId = pickClientId ?? legacyFiltered[0]?.client_id ?? null

  const messagesQ = useQuery({
    queryKey: ['messages-thread', clinicId, activeClientId],
    enabled: Boolean(clinicId && activeClientId && isSupabaseConfigured && !useWaInbox),
    queryFn: () => messageThreadService.listMessagesForClient(clinicId!, activeClientId!),
  })

  const sendWaM = useMutation({
    mutationFn: (text: string) => waApi.apiSendConversationMessage(clinicId!, activeConvId!, text),
    onSuccess: () => {
      setDraft('')
      void qc.invalidateQueries({ queryKey: ['wa-conv', clinicId, activeConvId] })
      void qc.invalidateQueries({ queryKey: ['wa-inbox', clinicId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const sendLegacyM = useMutation({
    mutationFn: (text: string) => messageThreadService.sendOutboundMessage(clinicId!, activeClientId!, null, text),
    onSuccess: () => {
      setDraft('')
      void qc.invalidateQueries({ queryKey: ['messages-thread', clinicId, activeClientId] })
      void qc.invalidateQueries({ queryKey: ['message-threads', clinicId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const assignM = useMutation({
    mutationFn: () => waApi.apiAssignConversation(clinicId!, activeConvId!),
    onSuccess: () => {
      toast.success('Conversa assumida.')
      void qc.invalidateQueries({ queryKey: ['wa-conv', clinicId, activeConvId] })
      void qc.invalidateQueries({ queryKey: ['wa-inbox', clinicId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const toggleAiM = useMutation({
    mutationFn: (enabled: boolean) => waApi.apiToggleConversationAi(clinicId!, activeConvId!, enabled),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['wa-conv', clinicId, activeConvId] }),
    onError: (e: Error) => toast.error(e.message),
  })

  const activeConv = waConversations.find((c) => c.id === activeConvId)
  const activeThread = legacyFiltered.find((t) => t.client_id === activeClientId)
  const waMessages = convDetailQ.data?.messages ?? []
  const legacyMessages = messagesQ.data ?? []
  const sending = useWaInbox ? sendWaM.isPending : sendLegacyM.isPending

  if (!isSupabaseConfigured) {
    return <Card padding="lg">Configure o Supabase para ver conversas.</Card>
  }
  if (!clinicId) return null

  return (
    <div key={clinicId} className="grid gap-4 lg:h-[calc(100dvh-10.5rem)] lg:grid-cols-[minmax(0,320px)_1fr_minmax(0,280px)]">
      <Card className="flex min-h-[280px] flex-col overflow-hidden p-0" padding="none">
        <div className="border-b border-slate-200/70 p-4 dark:border-white/10">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-sm font-extrabold">Inbox WhatsApp</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {useWaInbox ? 'Multiatendimento (Evolution)' : 'Histórico por cliente'}
              </div>
            </div>
            <Link to="/app/configuracoes/whatsapp" className="text-xs font-semibold text-brand-purple hover:underline">
              Conectar
            </Link>
          </div>
          <div className="mt-3">
            <Input placeholder="Buscar…" left={<Search className="h-4 w-4" />} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {useWaInbox ? (
            <label className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-600">
              <input type="checkbox" checked={onlyUnassigned} onChange={(e) => setOnlyUnassigned(e.target.checked)} />
              Somente na fila (sem responsável)
            </label>
          ) : null}
        </div>

        <div className="flex-1 overflow-auto p-2">
          {useWaInbox ? (
            waConversations.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-slate-500">
                Nenhuma conversa ainda.{' '}
                <Link to="/app/configuracoes/whatsapp" className="text-brand-purple hover:underline">
                  Conecte o WhatsApp
                </Link>
                .
              </p>
            ) : (
              waConversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setPickConvId(c.id)}
                  className={`mb-1 flex w-full items-start gap-3 rounded-3xl p-3 text-left transition ${
                    c.id === activeConvId
                      ? 'bg-gradient-to-r from-brand-purple/14 via-brand-blue/10 to-brand-teal/10 ring-1 ring-brand-purple/25 shadow-sm'
                      : 'hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 text-emerald-700 dark:text-emerald-300">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-extrabold">{c.contact_name}</div>
                      <div className="shrink-0 text-[11px] font-semibold text-slate-500">
                        {new Date(c.last_message_at).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge tone="neutral">{c.queue}</Badge>
                      {!c.assigned_to_id ? <Badge tone="amber">Fila</Badge> : null}
                      {c.ai_assistance_enabled ? <Badge tone="teal">IA</Badge> : null}
                    </div>
                  </div>
                </button>
              ))
            )
          ) : legacyFiltered.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-slate-500">Nenhuma mensagem registrada.</p>
          ) : (
            legacyFiltered.map((t) => (
              <button
                key={t.client_id}
                type="button"
                onClick={() => setPickClientId(t.client_id)}
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
                  <div className="truncate text-sm font-extrabold">{t.client_name}</div>
                  <div className="mt-1 truncate text-xs text-slate-600 dark:text-slate-300">{t.last_preview}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </Card>

      <Card className="flex min-h-[420px] flex-col overflow-hidden p-0" padding="none">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-4 py-3 dark:border-white/10">
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold">
              {useWaInbox ? (activeConv?.contact_name ?? 'Selecione uma conversa') : (activeThread?.client_name ?? 'Selecione uma conversa')}
            </div>
            <div className="truncate text-xs text-slate-500 dark:text-slate-400">Canal WhatsApp</div>
          </div>
          {useWaInbox && activeConvId ? (
            <div className="flex shrink-0 gap-1">
              <Button variant="outline" size="sm" loading={assignM.isPending} onClick={() => assignM.mutate()} leftIcon={<UserCheck className="h-3.5 w-3.5" />}>
                Assumir
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleAiM.mutate(!convDetailQ.data?.conversation?.ai_assistance_enabled)}
                leftIcon={<Bot className="h-3.5 w-3.5" />}
              >
                IA
              </Button>
            </div>
          ) : null}
        </div>

        <div className="flex-1 space-y-3 overflow-auto bg-gradient-to-b from-slate-900/[0.02] to-transparent px-3 py-4 dark:from-white/[0.03]">
          {(useWaInbox ? waMessages : legacyMessages).map((m) => {
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
              disabled={useWaInbox ? !activeConvId : !activeClientId}
            />
            <Button
              type="button"
              size="md"
              className="shrink-0 px-4"
              leftIcon={<Send className="h-4 w-4" />}
              loading={sending}
              disabled={(useWaInbox ? !activeConvId : !activeClientId) || !draft.trim()}
              onClick={() => (useWaInbox ? sendWaM : sendLegacyM).mutate(draft)}
            >
              Enviar
            </Button>
          </div>
        </div>
      </Card>

      <Card className="min-h-[280px] lg:min-h-0">
        <div className="text-base font-extrabold tracking-tight">Detalhes</div>
        {useWaInbox && activeConv ? (
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <div className="text-xs font-semibold text-slate-500">Contato</div>
              <div className="font-bold">{activeConv.contact_name}</div>
              {activeConv.phone ? <div className="text-slate-600">{activeConv.phone}</div> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="neutral">{activeConv.status}</Badge>
              <Badge tone="neutral">{activeConv.queue}</Badge>
            </div>
            <Link to="/app/clientes" className="inline-block text-sm font-semibold text-brand-purple hover:underline">
              Ver clientes
            </Link>
          </div>
        ) : activeThread ? (
          <div className="mt-4 space-y-3 text-sm">
            <div className="font-bold">{activeThread.client_name}</div>
            <Link to="/app/clientes" className="inline-block text-sm font-semibold text-brand-purple hover:underline">
              Ver clientes
            </Link>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Escolha uma conversa.</p>
        )}
      </Card>
    </div>
  )
}
