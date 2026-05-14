import { useQuery } from '@tanstack/react-query'
import { BarChart2, Calendar, MessageCircle, PawPrint, Users, Wallet } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { useClinicContext } from '../hooks/useClinicContext'
import { isSupabaseConfigured } from '../lib/supabase'
import * as reportsService from '../services/reportsService'

export default function RelatoriosPage() {
  const { clinicId } = useClinicContext()

  const repQ = useQuery({
    queryKey: ['reports', clinicId],
    enabled: Boolean(clinicId && isSupabaseConfigured),
    queryFn: () => reportsService.getOperationalReport(clinicId!),
  })

  if (!isSupabaseConfigured) return <Card padding="lg">Configure o Supabase para ver relatórios.</Card>
  if (!clinicId) return null

  const r = repQ.data

  const tiles = r
    ? [
        { label: 'Agendamentos (mês)', value: String(r.appointmentsThisMonth), icon: Calendar },
        { label: 'Clientes', value: String(r.clientsTotal), icon: Users },
        { label: 'Pets', value: String(r.petsTotal), icon: PawPrint },
        { label: 'Recebido (mês)', value: r.paidReaisMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: Wallet },
        { label: 'Pagamentos pendentes', value: String(r.pendingPayments), icon: BarChart2 },
        { label: 'Lembretes abertos', value: String(r.openReminders), icon: Calendar },
        { label: 'Mensagens não lidas', value: String(r.unreadMessages), icon: MessageCircle },
      ]
    : []

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Relatórios</h2>
        <p className="mt-1 text-sm text-slate-600">Resumo operacional em tempo real (dados do banco)</p>
      </div>

      {repQ.isLoading ? <div className="text-sm text-slate-500">Carregando…</div> : null}
      {repQ.isError ? <div className="text-sm text-rose-600">Erro ao montar relatório.</div> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((t) => {
          const Icon = t.icon
          return (
            <Card key={t.label} padding="md" className="border-[#E2E8F0] shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-purple/10 text-brand-purple">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500">{t.label}</div>
                  <div className="mt-1 text-xl font-black">{t.value}</div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
