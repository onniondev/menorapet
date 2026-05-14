import {
  BarChart2,
  Bell,
  CalendarDays,
  CreditCard,
  Gift,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Package,
  PawPrint,
  Settings2,
  Sparkles,
  UserCircle2,
  Users,
  UsersRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics'
import { useCurrentClinic } from '../../hooks/useCurrentClinic'
import { ClinicSwitcher } from './ClinicSwitcher'
import { LogoPetVia } from '../petvia/LogoPetVia'
import { Button } from '../ui/Button'

type NavItem = { to: string; label: string; icon: LucideIcon; showUnreadBadge?: boolean }

const items: NavItem[] = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/conversas', label: 'Conversas', icon: MessageCircle, showUnreadBadge: true },
  { to: '/app/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/app/clientes', label: 'Clientes', icon: Users },
  { to: '/app/pets', label: 'Pets', icon: PawPrint },
  { to: '/app/lembretes', label: 'Lembretes', icon: Bell },
  { to: '/app/financeiro', label: 'Financeiro', icon: CreditCard },
  { to: '/app/estoque', label: 'Estoque', icon: Package },
  { to: '/app/relatorios', label: 'Relatórios', icon: BarChart2 },
  { to: '/app/automacoes', label: 'Automações', icon: Sparkles },
  { to: '/app/equipe', label: 'Equipe', icon: UsersRound },
  { to: '/app/configuracoes', label: 'Configurações', icon: Settings2 },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { profile, signOut } = useAuth()
  const { clinic } = useCurrentClinic()
  const metrics = useDashboardMetrics(clinic?.id ?? null, '7d', clinic?.plan ?? null)

  const unread = metrics.data?.unreadMessages ?? 0
  const used = metrics.data?.messagesUsedMonth ?? 0
  const quota = metrics.data?.messagesQuota ?? 2000
  const pct = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0

  return (
    <aside className="flex h-[calc(100dvh-3rem)] w-[min(18rem,92vw)] shrink-0 flex-col overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 items-center gap-3">
          <LogoPetVia size={44} />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-base font-extrabold tracking-tight text-[#0F172A]">PetVia</div>
            <div className="truncate bg-gradient-to-r from-brand-purple to-brand-teal bg-clip-text text-xs font-semibold text-transparent">
              Clínica no automático
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 px-1">
        <ClinicSwitcher />
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1 overflow-auto pr-1">
        {items.map(({ to, label, icon: Icon, showUnreadBadge }) => {
          const badge = showUnreadBadge && unread > 0 ? unread : null
          return (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-purple/14 via-brand-blue/10 to-brand-teal/10 text-[#0F172A] shadow-sm ring-1 ring-brand-purple/20'
                    : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                }`
              }
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] transition group-hover:bg-white">
                <Icon className="h-5 w-5 opacity-90" />
              </span>
              <span className="min-w-0 flex-1 truncate">{label}</span>
              {badge ? (
                <span className="shrink-0 rounded-full bg-brand-purple px-2 py-0.5 text-[11px] font-extrabold text-white">{badge > 99 ? '99+' : badge}</span>
              ) : null}
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-3 space-y-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold text-[#0F172A]">{clinic?.name ?? 'Sua clínica'}</div>
            <div className="truncate text-xs font-semibold text-[#64748B]">{clinic?.plan ? `Plano ${clinic.plan}` : 'Plano'}</div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-[11px] font-extrabold text-[#64748B]">
            <span>Mensagens</span>
            <span>
              {used.toLocaleString('pt-BR')} / {quota.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white ring-1 ring-[#E2E8F0]">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-purple via-brand-blue to-brand-teal" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="md"
          fullWidth
          align="center"
          leftIcon={<Gift className="h-4 w-4" />}
          onClick={() => {
            toast.info('Programa de indicações em breve.')
            onNavigate?.()
          }}
        >
          Indique e ganhe
        </Button>
      </div>

      <div className="mt-3 space-y-3 rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-sm">
        <div className="flex items-start gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple to-brand-blue text-white shadow-lg shadow-brand-purple/20">
            <UserCircle2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-[#0F172A]">{profile?.full_name ?? 'Usuário'}</div>
            <div className="truncate text-xs text-[#64748B]">{profile?.email ?? ''}</div>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="md"
          fullWidth
          align="center"
          leftIcon={<LogOut className="h-4 w-4" />}
          onClick={() => {
            void signOut()
            onNavigate?.()
          }}
        >
          Sair
        </Button>
      </div>
    </aside>
  )
}
