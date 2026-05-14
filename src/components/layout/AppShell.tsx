import { Bell, Menu, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { MobileBottomNav } from './MobileBottomNav'
import { Sidebar } from './Sidebar'
import { IconButton } from '../ui/IconButton'
import { Input } from '../ui/Input'

const titles: Record<string, string> = {
  '/app/dashboard': 'Visão geral',
  '/app/conversas': 'Central de conversas',
  '/app/central-ia': 'Central IA',
  '/app/agenda': 'Agenda inteligente',
  '/app/pacientes': 'Pacientes',
  '/app/automacoes': 'Automações',
  '/app/financeiro': 'Financeiro',
  '/app/configuracoes': 'Configurações',
}

export function AppShell() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  const title = useMemo(() => {
    if (pathname.startsWith('/app/pacientes/') && pathname !== '/app/pacientes') return 'Perfil do pet'
    return titles[pathname] ?? 'Petvia IA'
  }, [pathname])

  return (
    <div className="relative min-h-dvh petvia-mesh text-ink dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 petvia-noise opacity-60 dark:opacity-40" />

      <div className="relative z-10 flex min-h-dvh">
        <div className="hidden lg:flex lg:items-stretch lg:py-6 lg:pl-6">
          <Sidebar />
        </div>

        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              aria-label="Fechar menu"
              onClick={() => setOpen(false)}
            />
            <div className="absolute left-4 top-4 bottom-4 w-[min(88vw,320px)]">
              <Sidebar onNavigate={() => setOpen(false)} />
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col lg:py-6 lg:pr-6 lg:pl-4">
          <header className="sticky top-0 z-30 px-4 pb-3 pt-4 lg:px-2 lg:pt-0">
            <div className="mx-auto flex w-full max-w-6xl items-center gap-3 rounded-3xl border border-white/60 bg-white/55 px-3 py-2.5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-2xl ring-1 ring-white/70 dark:border-white/10 dark:bg-slate-950/45 dark:shadow-[0_16px_55px_rgba(0,0,0,0.45)] dark:ring-white/5">
              <IconButton label="Abrir menu" className="lg:hidden" onClick={() => setOpen(true)}>
                <Menu className="h-5 w-5" />
              </IconButton>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-extrabold tracking-tight">{title}</div>
                <div className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">Petvia IA · experiência interna</div>
              </div>

              <div className="hidden w-[min(44vw,320px)] md:block">
                <Input placeholder="Buscar…" className="min-h-10 py-2" left={<Search className="h-4 w-4" />} />
              </div>

              <IconButton label="Notificações" className="hidden sm:inline-flex">
                <Bell className="h-5 w-5" />
              </IconButton>

              <Link
                to="/app/conversas"
                className="hidden rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-brand-purple/35 sm:inline dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200"
              >
                Abrir chat
              </Link>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-2 lg:px-2 lg:pb-8">
            <Outlet />
          </main>

          <MobileBottomNav />
        </div>
      </div>
    </div>
  )
}
