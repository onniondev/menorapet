import {
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Orbit,
  PawPrint,
  Settings2,
  Sparkles,
  UserCircle2,
  Users,
  UsersRound,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'
import { PetviaLogo } from '../PetviaLogo'

const items = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/conversas', label: 'Conversas', icon: MessageCircle },
  { to: '/app/central-ia', label: 'Central IA', icon: Orbit },
  { to: '/app/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/app/clientes', label: 'Clientes', icon: Users },
  { to: '/app/pets', label: 'Pets', icon: PawPrint },
  { to: '/app/automacoes', label: 'Automações', icon: Sparkles },
  { to: '/app/financeiro', label: 'Financeiro', icon: CreditCard },
  { to: '/app/equipe', label: 'Equipe', icon: UsersRound },
  { to: '/app/configuracoes', label: 'Configurações', icon: Settings2 },
] as const

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { profile, signOut } = useAuth()

  return (
    <aside className="flex h-[calc(100dvh-3rem)] w-[min(18rem,92vw)] shrink-0 flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/55 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.12)] backdrop-blur-2xl ring-1 ring-white/70 dark:border-white/10 dark:bg-slate-950/45 dark:shadow-[0_18px_70px_rgba(0,0,0,0.55)] dark:ring-white/5">
      <div className="flex items-center gap-3 px-1">
        <PetviaLogo size={44} />
        <div className="min-w-0 leading-tight">
          <div className="truncate text-base font-extrabold tracking-tight text-ink dark:text-white">Petvia</div>
          <div className="bg-gradient-to-r from-brand-purple to-brand-teal bg-clip-text text-xs font-semibold text-transparent">
            IA para clínicas
          </div>
        </div>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1 overflow-auto pr-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'bg-gradient-to-r from-brand-purple/18 via-brand-blue/10 to-brand-teal/10 text-ink shadow-sm ring-1 ring-brand-purple/25 dark:text-white dark:ring-brand-purple/35'
                  : 'text-slate-600 hover:bg-slate-900/[0.04] hover:text-ink dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white'
              }`
            }
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900/[0.03] ring-1 ring-slate-900/5 transition group-hover:bg-white/70 dark:bg-white/[0.04] dark:ring-white/10 dark:group-hover:bg-slate-900/55">
              <Icon className="h-5 w-5 opacity-90" />
            </span>
            <span className="min-w-0 truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-3 space-y-3 rounded-2xl border border-slate-200/70 bg-white/55 p-3 shadow-inner shadow-slate-900/[0.03] dark:border-white/10 dark:bg-slate-950/35">
        <div className="flex items-start gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple to-brand-blue text-white shadow-lg shadow-brand-purple/20">
            <UserCircle2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-ink dark:text-white">{profile?.full_name ?? 'Usuário'}</div>
            <div className="truncate text-xs text-slate-500 dark:text-slate-400">{profile?.email ?? ''}</div>
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
