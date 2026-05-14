import { Users } from 'lucide-react'
import { Card } from '../components/ui/Card'

export default function ClientesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Clientes</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Módulo em construção — dados reais virão na próxima etapa.</p>
      </div>
      <Card>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-purple/10 text-brand-purple dark:text-white">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold">Cadastro de tutores</div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Em breve: CRUD, busca e vínculo com pets.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
