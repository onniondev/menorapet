import {
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  PawPrint,
  Settings2,
  Sparkles,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PetviaLogo } from '../PetviaLogo'

const items = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/conversas', label: 'Conversas', icon: MessageCircle },
  { to: '/app/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/app/pacientes', label: 'Pacientes', icon: PawPrint },
  { to: '/app/automacoes', label: 'Automações', icon: Sparkles },
  { to: '/app/financeiro', label: 'Financeiro', icon: CreditCard },
  { to: '/app/configuracoes', label: 'Configurações', icon: Settings2 },
] as const

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth()

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-slate-200/70 bg-white/70 px-4 py-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/50">
      <div className="flex items-center gap-3 px-2">
        <PetviaLogo size={44} />
        <div className="leading-tight">
          <div className="text-base font-bold tracking-tight text-ink dark:text-white">Petvia</div>
          <div className="bg-gradient-to-r from-brand-purple to-brand-teal bg-clip-text text-xs font-semibold text-transparent">
            IA para clínicas
          </div>
        </div>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'bg-gradient-to-r from-brand-purple/15 to-brand-blue/10 text-brand-purple ring-1 ring-brand-purple/25 dark:from-brand-purple/25 dark:to-brand-blue/15 dark:text-white'
                  : 'text-slate-600 hover:bg-slate-900/5 hover:text-ink dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0 opacity-90" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-3 rounded-2xl border border-slate-200/70 bg-surface/80 p-3 dark:border-white/10 dark:bg-slate-900/40">
        <div className="flex items-start gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-blue text-xs font-bold text-white">
            <Users className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-ink dark:text-white">{user?.name}</div>
            <div className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.clinic}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            logout()
            onNavigate?.()
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white/70 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-200"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
