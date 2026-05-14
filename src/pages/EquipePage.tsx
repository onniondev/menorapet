import { UsersRound } from 'lucide-react'
import { Card } from '../components/ui/Card'

export default function EquipePage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Equipe</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Convites, papéis e permissões — integrado ao Supabase em breve.</p>
      </div>
      <Card>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
            <UsersRound className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold">Gestão de membros</div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Use convites e tabela clinic_members como base.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
