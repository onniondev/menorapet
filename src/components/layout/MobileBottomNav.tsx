import { CalendarDays, LayoutDashboard, MessageCircle, PawPrint, Sparkles } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

const items = [
  { to: '/app/dashboard', label: 'Início', icon: LayoutDashboard },
  { to: '/app/conversas', label: 'Chat', icon: MessageCircle },
  { to: '/app/central-ia', label: 'IA', icon: Sparkles, fab: true as const },
  { to: '/app/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/app/pets', label: 'Pets', icon: PawPrint },
] as const

export function MobileBottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/40 bg-white/70 px-2 pb-[max(env(safe-area-inset-bottom),10px)] pt-2 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/65 lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 items-end gap-1">
        {items.map((entry) => {
          const { to, label, icon: Icon } = entry
          const fab = 'fab' in entry && entry.fab

          const active =
            to === '/app/pets'
              ? pathname === to || pathname.startsWith('/app/pets/')
              : pathname === to || pathname.startsWith(`${to}/`)

          if (fab) {
            return (
              <div key={to} className="relative flex flex-col items-center justify-end pb-1">
                <NavLink
                  to={to}
                  className={`absolute -top-7 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-purple to-brand-blue text-white shadow-[0_16px_40px_rgba(124,58,237,0.35)] ring-4 ring-white/70 transition active:scale-95 dark:ring-slate-950 ${
                    active ? 'brightness-110' : 'opacity-95 hover:brightness-105'
                  }`}
                  aria-label="Central IA"
                >
                  <Icon className="h-6 w-6" />
                </NavLink>
                <span className="mt-8 text-[11px] font-semibold leading-none text-slate-600 dark:text-slate-300">{label}</span>
              </div>
            )
          }

          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center justify-end gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition ${
                active
                  ? 'text-brand-purple dark:text-brand-teal'
                  : 'text-slate-500 hover:text-ink dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'drop-shadow-[0_0_12px_rgba(124,58,237,0.35)]' : ''}`} />
              <span className="leading-none">{label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
