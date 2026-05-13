import { ChevronLeft, ChevronRight, Filter, Plus } from 'lucide-react'
import { weekSlots } from '../data/mock'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export default function Agenda() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight">Semana atual</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">12 — 16 de maio de 2026 · mock</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-slate-950/40"
            aria-label="Semana anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-slate-950/40"
            aria-label="Próxima semana"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <Button type="button" variant="outline" className="px-4 py-2" leftIcon={<Filter className="h-4 w-4" />}>
            Filtros
          </Button>
          <Button type="button" className="px-4 py-2" leftIcon={<Plus className="h-4 w-4" />}>
            Novo agendamento
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-2 text-xs">
          {['Veterinário: Todos', 'Status: Confirmado', 'Serviço: Consulta'].map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200"
            >
              {chip}
            </span>
          ))}
        </div>
      </Card>

      <div className="grid gap-3 lg:grid-cols-5">
        {weekSlots.map((d) => (
          <Card key={d.day} padding="sm" className="min-h-[220px]">
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-sm font-extrabold">{d.day}</div>
              <div className="text-xs font-semibold text-slate-500">{d.date}</div>
            </div>
            <div className="mt-4 space-y-2">
              {d.slots.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200/80 bg-slate-900/[0.02] px-3 py-6 text-center text-xs text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
                  Sem consultas
                </div>
              ) : (
                d.slots.map((s) => (
                  <div
                    key={`${d.day}-${s.t}`}
                    className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white/80 to-slate-50/60 p-3 text-sm shadow-sm dark:border-white/10 dark:from-slate-950/45 dark:to-slate-950/20"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-extrabold">{s.t}</div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${
                          s.status === 'confirmado'
                            ? 'bg-brand-teal/10 text-brand-teal ring-brand-teal/20'
                            : 'bg-amber-500/10 text-amber-800 ring-amber-500/20 dark:text-amber-200'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                    <div className="mt-2 font-semibold text-slate-800 dark:text-slate-100">{s.pet}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">{s.owner}</div>
                  </div>
                ))
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
