import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useMyClinics } from '../../hooks/useMyClinics'

export function GuestGate() {
  const { initialized, session } = useAuth()
  const { data: clinics, isLoading } = useMyClinics()

  if (!initialized) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface petvia-mesh dark:bg-slate-950">
        <div className="rounded-3xl border border-white/60 bg-white/70 px-6 py-4 text-sm font-semibold text-slate-600 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300">
          Carregando…
        </div>
      </div>
    )
  }

  if (session) {
    if (isLoading) {
      return (
        <div className="flex min-h-dvh items-center justify-center bg-surface petvia-mesh dark:bg-slate-950">
          <div className="rounded-3xl border border-white/60 bg-white/70 px-6 py-4 text-sm font-semibold text-slate-600 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300">
            Carregando…
          </div>
        </div>
      )
    }
    if (clinics && clinics.length > 0) {
      return <Navigate to="/app/dashboard" replace />
    }
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
