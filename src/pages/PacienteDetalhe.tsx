import { Activity, ArrowLeft, Calendar, Heart, MessageCircle, Pill, Syringe } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { patientHistory, patientRichProfiles, patients } from '../data/mock'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export default function PacienteDetalhe() {
  const { id } = useParams()
  const pet = patients.find((p) => p.id === id) ?? patients[0]
  const rich = patientRichProfiles[pet.id] ?? patientRichProfiles.p1

  const maxH = Math.max(...(rich?.health ?? [1]), 1)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/app/pacientes"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-brand-purple hover:underline dark:text-brand-teal"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="md" variant="outline">
            Nova consulta
          </Button>
          <Button type="button" size="md" variant="outline">
            Enviar lembrete
          </Button>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="relative h-56 w-full sm:h-64">
          <img src={rich?.photo} alt={pet.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="text-3xl font-black tracking-tight text-white">{pet.name}</div>
              <div className="mt-1 text-sm font-semibold text-white/85">{pet.species}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone="teal" leftIcon={<Heart className="h-3.5 w-3.5" />}>
                  {rich?.mood ?? pet.status}
                </Badge>
                <Badge tone="neutral">{rich?.age ?? '—'}</Badge>
              </div>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md">
              Perfil emocional
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5 sm:p-7">
          <div className="rounded-[1.5rem] border border-brand-purple/20 bg-gradient-to-br from-brand-purple/10 via-white/40 to-brand-teal/10 p-4 text-sm font-semibold text-slate-800 shadow-inner dark:from-brand-purple/15 dark:via-slate-950/30 dark:to-brand-teal/10 dark:text-slate-100">
            <div className="flex items-center gap-2 text-xs font-extrabold text-brand-purple dark:text-brand-teal">
              <MessageCircle className="h-4 w-4" />
              Observação IA
            </div>
            <div className="mt-2 leading-relaxed">{rich?.iaNote}</div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card padding="md" className="lg:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-extrabold">Evolução (mock)</div>
                <Activity className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-4 flex h-28 items-end justify-between gap-1">
                {(rich?.health ?? []).map((v, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t-2xl bg-gradient-to-t from-brand-purple via-brand-blue to-brand-teal"
                    initial={{ height: '10%' }}
                    animate={{ height: `${Math.max(10, Math.round((v / maxH) * 100))}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22, delay: i * 0.03 }}
                  />
                ))}
              </div>
            </Card>

            <Card padding="md">
              <div className="text-sm font-extrabold">Vacinas</div>
              <div className="mt-3 space-y-2">
                {(rich?.vaccines ?? []).map((v) => (
                  <div key={v.name} className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200/70 bg-white/55 px-3 py-2 text-xs dark:border-white/10 dark:bg-slate-950/35">
                    <span className="font-bold">{v.name}</span>
                    <Badge tone={v.status === 'due' ? 'amber' : 'teal'}>{v.due}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card padding="md">
              <div className="flex items-center gap-2 text-sm font-extrabold">
                <Pill className="h-4 w-4 text-brand-purple" />
                Exames
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                {(rich?.exams ?? []).map((e) => (
                  <li key={e} className="rounded-2xl border border-slate-200/70 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-slate-950/35">
                    {e}
                  </li>
                ))}
              </ul>
            </Card>
            <Card padding="md">
              <div className="flex items-center gap-2 text-sm font-extrabold">
                <Syringe className="h-4 w-4 text-brand-teal" />
                Prescrições
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                {(rich?.prescriptions ?? []).map((p) => (
                  <li key={p} className="rounded-2xl border border-slate-200/70 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-slate-950/35">
                    {p}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">Histórico clínico</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Timeline visual · sem tabela</p>
          </div>
          <Calendar className="h-5 w-5 text-slate-400" />
        </div>
        <div className="relative mt-6 space-y-0 pl-2">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-brand-teal/35 via-brand-blue/25 to-brand-purple/25" />
          {patientHistory.map((h, idx) => (
            <div key={h.id} className="relative pb-7 pl-10">
              <span className="absolute left-[9px] top-1.5 h-3 w-3 rounded-full bg-white ring-4 ring-brand-teal/25 dark:bg-slate-950 dark:ring-brand-teal/35" />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-extrabold">{h.title}</div>
                <div className="text-xs font-semibold text-slate-500">{h.date}</div>
              </div>
              <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">{h.note}</div>
              {idx === 0 ? (
                <div className="mt-3 inline-flex">
                  <Badge tone="success">evolução favorável</Badge>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
