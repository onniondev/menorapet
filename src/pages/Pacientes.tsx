import { ArrowRight, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { patients } from '../data/mock'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

export default function Pacientes() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight">Pacientes</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Pets cadastrados · dados mockados</p>
        </div>
        <div className="w-full sm:max-w-md">
          <Input placeholder="Buscar por nome, tutor ou espécie…" left={<Search className="h-4 w-4" />} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {patients.map((p) => (
          <Card key={p.id} className="group relative overflow-hidden">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-brand-purple/15 to-brand-teal/10 blur-2xl transition group-hover:opacity-100" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-extrabold tracking-tight">{p.name}</div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{p.species}</div>
              </div>
              <span className="rounded-full bg-slate-900/5 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                ativo
              </span>
            </div>
            <div className="relative mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">Responsável</span>
                <span className="font-semibold">{p.owner}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">Última consulta</span>
                <span className="font-semibold">{p.lastVisit}</span>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/50 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-950/35 dark:text-slate-200">
                {p.status}
              </div>
            </div>
            <Link
              to={`/app/pacientes/${p.id}`}
              className="relative mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-brand-purple hover:underline dark:text-brand-teal"
            >
              Ver detalhes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}
