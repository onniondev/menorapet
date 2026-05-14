import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function RequireAuth() {
  const { initialized, session } = useAuth()
  const location = useLocation()

  if (!initialized) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface petvia-mesh dark:bg-slate-950">
        <div className="rounded-3xl border border-white/60 bg-white/70 px-6 py-4 text-sm font-semibold text-slate-600 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300">
          Carregando sessão…
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
