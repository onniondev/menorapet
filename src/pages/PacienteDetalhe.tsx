import { ArrowLeft, Calendar, Syringe } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { patientHistory, patients } from '../data/mock'
import { Card } from '../components/ui/Card'

export default function PacienteDetalhe() {
  const { id } = useParams()
  const pet = patients.find((p) => p.id === id) ?? patients[0]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/app/pacientes"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-brand-purple hover:underline dark:text-brand-teal"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-purple/35 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200"
          >
            Nova consulta
          </button>
          <button
            type="button"
            className="rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-purple/35 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200"
          >
            Enviar lembrete
          </button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-2xl font-extrabold tracking-tight">{pet.name}</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{pet.species}</div>
            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/70 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-slate-950/35">
                <div className="text-xs font-semibold text-slate-500">Responsável</div>
                <div className="mt-1 font-extrabold">{pet.owner}</div>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-slate-950/35">
                <div className="text-xs font-semibold text-slate-500">Última consulta</div>
                <div className="mt-1 font-extrabold">{pet.lastVisit}</div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <span className="inline-flex items-center gap-2 rounded-2xl bg-brand-teal/10 px-3 py-2 text-xs font-semibold text-brand-teal ring-1 ring-brand-teal/20">
              <Syringe className="h-4 w-4" />
              Carteira de vacinas em dia
            </span>
            <span className="inline-flex items-center gap-2 rounded-2xl bg-brand-purple/10 px-3 py-2 text-xs font-semibold text-brand-purple ring-1 ring-brand-purple/20 dark:text-white">
              <Calendar className="h-4 w-4" />
              Próximo retorno sugerido
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold tracking-tight">Histórico clínico</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Linha do tempo · mock</p>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {patientHistory.map((h, idx) => (
            <div key={h.id} className="rounded-2xl border border-slate-200/70 bg-white/50 p-4 dark:border-white/10 dark:bg-slate-950/35">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-extrabold">{h.title}</div>
                <div className="text-xs font-semibold text-slate-500">{h.date}</div>
              </div>
              <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">{h.note}</div>
              {idx === 0 ? (
                <div className="mt-3 inline-flex rounded-full bg-slate-900/5 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                  evolução favorável
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
