import { ChevronLeft, ChevronRight, GripVertical, Plus, Sparkles, Wand2 } from 'lucide-react'
import { Reorder, motion } from 'framer-motion'
import { useState } from 'react'
import { agendaAiHints, todayDraggableAppointments, weekSlots } from '../data/mock'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { IconButton } from '../components/ui/IconButton'

export default function Agenda() {
  const [slots, setSlots] = useState(todayDraggableAppointments)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Agenda inteligente</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Timeline fluida · arraste para reordenar (mock)</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <IconButton label="Semana anterior">
            <ChevronLeft className="h-5 w-5" />
          </IconButton>
          <IconButton label="Próxima semana">
            <ChevronRight className="h-5 w-5" />
          </IconButton>
          <Button type="button" variant="outline" size="md" leftIcon={<Wand2 className="h-4 w-4" />}>
            Filtros
          </Button>
          <Button type="button" size="md" leftIcon={<Plus className="h-4 w-4" />}>
            Novo agendamento
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_1fr]">
        <Card padding="md" className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-brand-purple/20 to-brand-teal/10 blur-3xl" />
          <div className="relative flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-purple" />
            <div className="text-sm font-extrabold">IA da agenda</div>
          </div>
          <div className="relative mt-4 space-y-3">
            {agendaAiHints.map((h) => (
              <div key={h.id} className="rounded-3xl border border-slate-200/70 bg-white/55 p-3 text-sm dark:border-white/10 dark:bg-slate-950/35">
                <div className="text-xs font-extrabold text-brand-purple dark:text-brand-teal">{h.title}</div>
                <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">{h.detail}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg" className="relative overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-extrabold tracking-tight">Hoje · linha do tempo</div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">Cards vivos · status e urgência</div>
            </div>
            <Badge tone="purple">encaixes IA</Badge>
          </div>

          <div className="relative mt-6 pl-3">
            <div className="absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-brand-purple/35 via-brand-blue/25 to-brand-teal/25" />
            <Reorder.Group axis="y" values={slots} onReorder={setSlots} className="space-y-3">
              {slots.map((s) => (
                <Reorder.Item
                  key={s.id}
                  value={s}
                  className="relative cursor-grab rounded-[1.35rem] border border-slate-200/75 bg-gradient-to-br from-white/85 to-slate-50/55 p-4 pl-12 shadow-sm active:cursor-grabbing dark:border-white/10 dark:from-slate-950/55 dark:to-slate-950/25"
                  whileDrag={{ scale: 1.02, boxShadow: '0 18px 50px rgba(124,58,237,0.18)' }}
                >
                  <div className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-slate-400">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <span className="absolute left-[15px] top-6 h-3 w-3 rounded-full bg-white ring-4 ring-brand-purple/25 dark:bg-slate-950 dark:ring-brand-purple/35" />

                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-black text-brand-purple dark:text-brand-teal">{s.time}</div>
                        {s.urgent ? (
                          <Badge tone="amber">urgente</Badge>
                        ) : (
                          <Badge tone="teal">{s.status}</Badge>
                        )}
                      </div>
                      <div className="mt-2 text-lg font-extrabold tracking-tight">{s.pet}</div>
                      <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{s.owner}</div>
                      <div className="mt-2 text-xs font-semibold text-slate-500">{s.reason}</div>
                    </div>
                    <motion.div
                      className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple/15 to-brand-blue/10 text-xs font-black text-brand-purple dark:text-white"
                      whileHover={{ rotate: [0, -6, 6, 0] }}
                      transition={{ duration: 0.6 }}
                    >
                      {s.pet.slice(0, 1)}
                    </motion.div>
                  </div>
                  <div className="mt-3 text-[11px] font-semibold text-slate-500">com {s.vet}</div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        </Card>
      </div>

      <Card padding="md">
        <div className="mb-3 text-sm font-extrabold">Semana (visão compacta)</div>
        <div className="grid gap-3 sm:grid-cols-5">
          {weekSlots.map((d) => (
            <div
              key={d.day}
              className="rounded-3xl border border-slate-200/70 bg-white/55 p-3 text-center dark:border-white/10 dark:bg-slate-950/35"
            >
              <div className="text-xs font-extrabold text-slate-500">{d.day}</div>
              <div className="text-lg font-black">{d.date}</div>
              <div className="mt-2 text-[11px] font-semibold text-slate-500">{d.slots.length} consultas</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
