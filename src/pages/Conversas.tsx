import {
  CalendarPlus,
  CreditCard,
  ListTodo,
  MessageCircle,
  MoreVertical,
  Phone,
  Search,
  Stethoscope,
  UserRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { chatMessages, conversations } from '../data/mock'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

export default function Conversas() {
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? 'c1')
  const active = useMemo(() => conversations.find((c) => c.id === activeId) ?? conversations[0], [activeId])

  return (
    <div className="grid gap-4 lg:h-[calc(100dvh-8.5rem)] lg:grid-cols-[320px_1fr_320px]">
      <Card className="flex min-h-[320px] flex-col p-0 lg:min-h-0" padding="none">
        <div className="border-b border-slate-200/70 p-4 dark:border-white/10">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-sm font-extrabold">Conversas</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">WhatsApp · mock</div>
            </div>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/70 text-slate-700 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200"
              aria-label="Mais opções"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3">
            <Input placeholder="Buscar cliente ou pet…" className="py-2" left={<Search className="h-4 w-4" />} />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {conversations.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveId(c.id)}
              className={`mb-1 flex w-full items-start gap-3 rounded-2xl p-3 text-left transition ${
                c.id === active?.id
                  ? 'bg-gradient-to-r from-brand-purple/12 to-brand-blue/10 ring-1 ring-brand-purple/20 dark:from-brand-purple/20 dark:to-brand-blue/10'
                  : 'hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 text-emerald-700 dark:text-emerald-300">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-extrabold">{c.name}</div>
                  <div className="shrink-0 text-[11px] font-semibold text-slate-500">{c.time}</div>
                </div>
                <div className="truncate text-xs text-slate-500 dark:text-slate-400">{c.pet}</div>
                <div className="mt-1 truncate text-xs text-slate-600 dark:text-slate-300">{c.last}</div>
              </div>
              {c.unread ? (
                <span className="mt-1 inline-flex min-w-6 justify-center rounded-full bg-brand-purple px-2 py-0.5 text-[11px] font-extrabold text-white">
                  {c.unread}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex min-h-[420px] flex-col p-0 lg:min-h-0" padding="none">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-4 py-3 dark:border-white/10">
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold">{active?.name}</div>
            <div className="truncate text-xs text-slate-500 dark:text-slate-400">{active?.pet}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-500/20 sm:inline dark:text-emerald-300">
              online
            </span>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-slate-950/40"
              aria-label="Menu do chat"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-auto bg-gradient-to-b from-slate-900/[0.02] to-transparent px-3 py-4 dark:from-white/[0.03]">
          {chatMessages.map((m) => {
            const mine = m.role === 'ia'
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[min(92%,520px)] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    mine
                      ? 'rounded-br-md bg-gradient-to-br from-brand-purple to-brand-blue text-white'
                      : 'rounded-bl-md border border-slate-200/70 bg-white/80 text-slate-800 dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-100'
                  }`}
                >
                  <div>{m.text}</div>
                  <div className={`mt-2 text-[11px] font-semibold ${mine ? 'text-white/80' : 'text-slate-500'}`}>{m.time}</div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="border-t border-slate-200/70 p-3 dark:border-white/10">
          <div className="flex items-end gap-2">
            <div className="flex-1 rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-2 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-400">
              Escreva uma mensagem…
            </div>
            <Button className="px-4 py-2" type="button">
              Enviar
            </Button>
          </div>
        </div>
      </Card>

      <Card className="min-h-[320px] lg:min-h-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold tracking-tight">Painel do paciente</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Dados mockados · ações rápidas</p>
          </div>
          <Stethoscope className="h-5 w-5 text-slate-400" />
        </div>

        <div className="mt-4 space-y-3 rounded-2xl border border-slate-200/70 bg-white/50 p-3 dark:border-white/10 dark:bg-slate-950/35">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple/15 to-brand-blue/10">
              <UserRound className="h-5 w-5 text-brand-purple dark:text-white" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold">Responsável</div>
              <div className="truncate text-xs text-slate-600 dark:text-slate-400">{active?.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Phone className="h-4 w-4" />
            (11) 98888-7766
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Histórico resumido</div>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <li className="rounded-2xl border border-slate-200/70 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-slate-950/35">
              08/05 — Retorno pós-operatório
            </li>
            <li className="rounded-2xl border border-slate-200/70 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-slate-950/35">
              20/04 — Cirurgia (castração)
            </li>
          </ul>
        </div>

        <div className="mt-5 grid gap-2">
          <Button type="button" className="w-full justify-between py-3" variant="outline" rightIcon={<MessageCircle className="h-4 w-4" />}>
            Assumir conversa
          </Button>
          <Button type="button" className="w-full justify-between py-3" variant="outline" rightIcon={<CalendarPlus className="h-4 w-4" />}>
            Agendar consulta
          </Button>
          <Button type="button" className="w-full justify-between py-3" variant="outline" rightIcon={<CreditCard className="h-4 w-4" />}>
            Enviar cobrança
          </Button>
          <Button type="button" className="w-full justify-between py-3" variant="outline" rightIcon={<ListTodo className="h-4 w-4" />}>
            Criar tarefa
          </Button>
        </div>
      </Card>
    </div>
  )
}
