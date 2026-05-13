import { Menu, PanelLeftClose, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'

const titles: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/conversas': 'Conversas',
  '/app/agenda': 'Agenda',
  '/app/pacientes': 'Pacientes',
  '/app/automacoes': 'Automações',
  '/app/financeiro': 'Financeiro',
  '/app/configuracoes': 'Configurações',
}

export function AppShell() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  const title = useMemo(() => {
    if (pathname.startsWith('/app/pacientes/') && pathname !== '/app/pacientes') return 'Detalhe do paciente'
    return titles[pathname] ?? 'Petvia IA'
  }, [pathname])

  return (
    <div className="flex min-h-dvh bg-surface text-ink dark:bg-slate-950 dark:text-slate-100">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[min(88vw,320px)] shadow-2xl">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/70 text-ink shadow-sm transition hover:bg-white lg:hidden dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
                onClick={() => setOpen(true)}
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight">{title}</h1>
                  <span className="hidden items-center gap-1 rounded-full bg-gradient-to-r from-brand-purple/15 to-brand-teal/15 px-2 py-0.5 text-[11px] font-semibold text-brand-purple ring-1 ring-brand-purple/20 sm:inline-flex dark:text-white">
                    <Sparkles className="h-3.5 w-3.5" />
                    IA ativa
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Painel da clínica · dados mockados</p>
              </div>
            </div>

            <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex dark:text-slate-400">
              <PanelLeftClose className="h-4 w-4" />
              <span>Layout responsivo</span>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
