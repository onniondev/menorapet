import { Bell, Calendar, CreditCard, Syringe, ToggleLeft, ToggleRight, Users } from 'lucide-react'
import { automationFlows } from '../data/mock'
import { Card } from '../components/ui/Card'

const iconMap = {
  bell: Bell,
  syringe: Syringe,
  calendar: Calendar,
  credit: CreditCard,
  users: Users,
} as const

export default function Automacoes() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-extrabold tracking-tight">Automações</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Fluxos configuráveis · liga/desliga · mock (sem persistência)
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {automationFlows.map((f) => {
          const Icon = iconMap[f.icon]
          return (
            <Card key={f.id} className="relative overflow-hidden">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-brand-purple/15 to-brand-blue/10 blur-2xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple/15 to-brand-teal/10 text-brand-purple dark:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-extrabold tracking-tight">{f.title}</div>
                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{f.desc}</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:border-brand-purple/35 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200"
                  aria-label={f.active ? 'Desativar fluxo' : 'Ativar fluxo'}
                >
                  {f.active ? <ToggleRight className="h-4 w-4 text-brand-teal" /> : <ToggleLeft className="h-4 w-4 text-slate-400" />}
                  {f.active ? 'Ativo' : 'Inativo'}
                </button>
              </div>

              <div className="relative mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-900/5 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                  Gatilhos
                </span>
                <span className="rounded-full bg-slate-900/5 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                  WhatsApp
                </span>
                <span className="rounded-full bg-slate-900/5 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                  Aprovação opcional
                </span>
              </div>

              <div className="relative mt-4 flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-2xl border border-slate-200/80 bg-white/70 py-2 text-sm font-extrabold text-slate-800 transition hover:border-brand-purple/35 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-100"
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-blue py-2 text-sm font-extrabold text-white shadow-lg shadow-brand-purple/15 transition hover:brightness-[1.03]"
                >
                  Simular
                </button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
