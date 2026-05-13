import { ArrowUpRight, QrCode } from 'lucide-react'
import { financeRows } from '../data/mock'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export default function Financeiro() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight">Financeiro</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Resumo operacional · mock</p>
        </div>
        <Button type="button" className="w-full sm:w-auto" leftIcon={<QrCode className="h-4 w-4" />}>
          Enviar Pix / cobrança
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {financeRows.map((r) => (
          <Card key={r.id}>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{r.label}</div>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div className="text-2xl font-extrabold tracking-tight">{r.value}</div>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/5 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                <ArrowUpRight className="h-3.5 w-3.5" />
                {r.hint}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-extrabold tracking-tight">Últimas cobranças</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Lista curta para validar layout</p>
          </div>
          <Button type="button" variant="outline" className="px-4 py-2">
            Exportar CSV
          </Button>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/70 dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/[0.03] text-xs font-extrabold text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Canal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
              {[
                { who: 'Marina Lopes', amount: 'R$ 240,00', status: 'Pago', channel: 'Pix' },
                { who: 'João Pereira', amount: 'R$ 180,00', status: 'Pendente', channel: 'Link' },
                { who: 'Carla Mendes', amount: 'R$ 95,00', status: 'Pago', channel: 'Cartão' },
              ].map((row) => (
                <tr key={row.who} className="bg-white/40 dark:bg-slate-950/20">
                  <td className="px-4 py-3 font-semibold">{row.who}</td>
                  <td className="px-4 py-3">{row.amount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-extrabold ring-1 ${
                        row.status === 'Pago'
                          ? 'bg-brand-teal/10 text-brand-teal ring-brand-teal/20'
                          : 'bg-amber-500/10 text-amber-900 ring-amber-500/20 dark:text-amber-200'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.channel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
