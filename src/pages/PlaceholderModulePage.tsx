import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'

type Props = { title: string; description?: string }

export default function PlaceholderModulePage({ title, description }: Props) {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        to="/app/dashboard"
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/80 px-3 py-2 text-xs font-semibold text-ink shadow-sm transition hover:border-brand-purple/35 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao dashboard
      </Link>
      <Card padding="lg" className="border-[#E2E8F0] bg-white shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">{title}</h1>
        <p className="mt-2 text-sm font-medium text-[#64748B]">
          {description ?? 'Este módulo está em construção. Em breve você terá fluxos completos aqui.'}
        </p>
      </Card>
    </div>
  )
}
