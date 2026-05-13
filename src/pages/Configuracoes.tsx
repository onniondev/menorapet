import { Bot, Building2, Clock, MessageCircle, Shield, Users } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

const sections = [
  {
    title: 'Dados da clínica',
    icon: Building2,
    fields: ['Nome fantasia', 'CNPJ', 'Endereço', 'Telefone público'],
  },
  {
    title: 'Horários de atendimento',
    icon: Clock,
    fields: ['Segunda a sexta', 'Sábado', 'Plantão (opcional)'],
  },
  {
    title: 'Integração com WhatsApp',
    icon: MessageCircle,
    fields: ['Número conectado', 'Mensagem de boas-vindas', 'Janela de silêncio'],
  },
  {
    title: 'Equipe e permissões',
    icon: Users,
    fields: ['Convites', 'Papéis', 'Acesso a financeiro'],
  },
  {
    title: 'Preferências da IA',
    icon: Bot,
    fields: ['Tom de voz', 'Aprovação antes de enviar', 'Assinatura nas mensagens'],
  },
] as const

export default function Configuracoes() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight">Configurações</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Formulários mockados · sem persistência</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200">
          <Shield className="h-4 w-4 text-brand-purple" />
          Ambiente seguro (demo)
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.title}>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple/15 to-brand-blue/10 text-brand-purple dark:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-extrabold tracking-tight">{s.title}</div>
                  <div className="mt-4 space-y-3">
                    {s.fields.map((label) => (
                      <Input key={label} label={label} placeholder="Preencha aqui…" />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
