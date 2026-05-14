import {
  CalendarPlus,
  CreditCard,
  ListTodo,
  MessageCircle,
  Mic,
  MoreVertical,
  Phone,
  Search,
  Stethoscope,
  UserRound,
  Users,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { chatMessages, conversationMeta, conversations } from '../data/mock'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { IconButton } from '../components/ui/IconButton'
import { Input } from '../components/ui/Input'

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-white/80"
          animate={{ y: [0, -4, 0], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }}
        />
      ))}
    </div>
  )
}

export default function Conversas() {
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? 'c1')

  const active = useMemo(() => conversations.find((c) => c.id === activeId) ?? conversations[0], [activeId])
  const meta = active ? conversationMeta[active.id] : undefined

  return (
    <div className="grid gap-4 lg:h-[calc(100dvh-10.5rem)] lg:grid-cols-[minmax(0,320px)_1fr_minmax(0,320px)]">
      <Card className="flex min-h-[300px] flex-col overflow-hidden p-0" padding="none">
        <div className="border-b border-slate-200/70 p-4 dark:border-white/10">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-sm font-extrabold">Clientes</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">WhatsApp premium · mock</div>
            </div>
            <IconButton label="Mais opções">
              <MoreVertical className="h-4 w-4" />
            </IconButton>
          </div>
          <div className="mt-3">
            <Input placeholder="Buscar cliente ou pet…" left={<Search className="h-4 w-4" />} />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {conversations.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveId(c.id)}
              className={`mb-1 flex w-full items-start gap-3 rounded-3xl p-3 text-left transition ${
                c.id === active?.id
                  ? 'bg-gradient-to-r from-brand-purple/14 via-brand-blue/10 to-brand-teal/10 ring-1 ring-brand-purple/25 shadow-sm'
                  : 'hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 text-emerald-700 dark:text-emerald-300">
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
                <span className="mt-1 inline-flex min-w-6 justify-center rounded-full bg-brand-purple px-2 py-0.5 text-[11px] font-extrabold text-white shadow-lg shadow-brand-purple/25">
                  {c.unread}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex min-h-[420px] flex-col overflow-hidden p-0" padding="none">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-4 py-3 dark:border-white/10">
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold">{active?.name}</div>
            <div className="truncate text-xs text-slate-500 dark:text-slate-400">{active?.pet}</div>
          </div>
          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              <motion.span
                key={`status-${activeId}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="hidden sm:inline-flex"
              >
                <motion.span
                  initial={{ opacity: 1 }}
                  animate={{ opacity: [1, 1, 0] }}
                  transition={{ duration: 1.45, times: [0, 0.75, 1], ease: 'easeOut' }}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-purple to-brand-blue px-3 py-1 text-[11px] font-bold text-white shadow-md"
                >
                  IA respondendo
                </motion.span>
              </motion.span>
            </AnimatePresence>
            <IconButton label="Menu do chat">
              <MoreVertical className="h-4 w-4" />
            </IconButton>
          </div>
        </div>

        <div className="border-b border-slate-200/70 px-4 py-3 dark:border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Intenção detectada</div>
            <Badge tone="purple">{meta?.intent ?? '—'}</Badge>
          </div>
          <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">{meta?.summary}</div>
        </div>

        <div className="flex-1 space-y-3 overflow-auto bg-gradient-to-b from-slate-900/[0.02] to-transparent px-3 py-4 dark:from-white/[0.03]">
          {chatMessages.map((m) => {
            const mine = m.role === 'ia'
            return (
              <motion.div
                key={m.id}
                className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              >
                <div
                  className={`max-w-[min(92%,520px)] rounded-[1.35rem] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    mine
                      ? 'rounded-br-md bg-gradient-to-br from-brand-purple to-brand-blue text-white shadow-[0_14px_40px_rgba(124,58,237,0.25)]'
                      : 'rounded-bl-md border border-slate-200/75 bg-white/85 text-slate-800 dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-100'
                  }`}
                >
                  <div>{m.text}</div>
                  <div className={`mt-2 text-[11px] font-semibold ${mine ? 'text-white/80' : 'text-slate-500'}`}>{m.time}</div>
                </div>
              </motion.div>
            )
          })}

          <AnimatePresence>
            <motion.div
              key={`typing-${activeId}`}
              className="flex justify-end"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="rounded-3xl rounded-br-md bg-gradient-to-br from-brand-purple to-brand-blue px-4 py-2 shadow-lg shadow-brand-purple/20"
                initial={{ opacity: 1 }}
                animate={{ opacity: [1, 1, 0] }}
                transition={{ duration: 1.45, times: [0, 0.78, 1], ease: 'easeOut' }}
              >
                <TypingDots />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="border-t border-slate-200/70 p-3 dark:border-white/10">
          <div className="mb-2 flex flex-wrap gap-2">
            {(meta?.suggested ?? []).slice(0, 3).map((s) => (
              <button
                key={s}
                type="button"
                className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-brand-purple/35 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-stretch gap-2">
            <IconButton label="Mensagem de voz">
              <Mic className="h-4 w-4" />
            </IconButton>
            <div className="flex min-h-11 flex-1 items-center rounded-2xl border border-slate-200/85 bg-white/75 px-3 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-400">
              Escreva uma mensagem…
            </div>
            <Button type="button" size="md" className="shrink-0 px-5">
              Enviar
            </Button>
          </div>
        </div>
      </Card>

      <Card className="min-h-[300px] lg:min-h-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold tracking-tight">Painel IA + pet</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Contexto vivo · tags inteligentes</p>
          </div>
          <Stethoscope className="h-5 w-5 text-slate-400" />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(meta?.tags ?? []).map((t) => (
            <Badge key={t} tone="neutral">
              {t}
            </Badge>
          ))}
        </div>

        <div className="mt-4 grid gap-3 rounded-3xl border border-slate-200/70 bg-white/50 p-3 dark:border-white/10 dark:bg-slate-950/35">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple/15 to-brand-blue/10">
              <UserRound className="h-5 w-5 text-brand-purple dark:text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-500">Responsável</div>
              <div className="truncate text-sm font-extrabold">{active?.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Phone className="h-4 w-4" />
            (11) 98888-7766
          </div>
          <div className="grid gap-2 text-xs">
            <div className="flex items-center justify-between gap-2 rounded-2xl bg-slate-900/[0.02] px-3 py-2 dark:bg-white/[0.03]">
              <span className="font-semibold text-slate-500">Próxima vacina</span>
              <span className="font-bold text-ink dark:text-white">{meta?.nextVaccine}</span>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-2xl bg-slate-900/[0.02] px-3 py-2 dark:bg-white/[0.03]">
              <span className="font-semibold text-slate-500">Última consulta</span>
              <span className="font-bold text-ink dark:text-white">{meta?.lastVisit}</span>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-2xl bg-slate-900/[0.02] px-3 py-2 dark:bg-white/[0.03]">
              <span className="font-semibold text-slate-500">Cobranças</span>
              <span className="font-bold text-ink dark:text-white">{meta?.billing}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-3xl border border-dashed border-brand-purple/25 bg-brand-purple/[0.04] p-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
          Resumo automático: triagem estável, sem sinais de urgência alta no mock.
        </div>

        <div className="mt-5 grid gap-2">
          <Button type="button" fullWidth size="md" variant="outline" align="between" rightIcon={<Users className="h-4 w-4" />}>
            Transferir humano
          </Button>
          <Button type="button" fullWidth size="md" variant="outline" align="between" rightIcon={<CalendarPlus className="h-4 w-4" />}>
            Agendar
          </Button>
          <Button type="button" fullWidth size="md" variant="outline" align="between" rightIcon={<CreditCard className="h-4 w-4" />}>
            Cobrar
          </Button>
          <Button type="button" fullWidth size="md" variant="outline" align="between" rightIcon={<ListTodo className="h-4 w-4" />}>
            Criar retorno
          </Button>
          <Button type="button" fullWidth size="md" variant="ghost" align="between" rightIcon={<MessageCircle className="h-4 w-4" />}>
            Registrar observação
          </Button>
        </div>
      </Card>
    </div>
  )
}
