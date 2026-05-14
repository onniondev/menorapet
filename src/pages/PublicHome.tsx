import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMyClinics } from '../hooks/useMyClinics'
import LandingPage from './LandingPage'

function BootScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface petvia-mesh dark:bg-slate-950">
      <div className="rounded-3xl border border-white/60 bg-white/70 px-6 py-4 text-sm font-semibold text-slate-600 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300">
        Carregando…
      </div>
    </div>
  )
}

/** Rota `/`: landing para visitantes; logado vai ao app ou onboarding. */
export default function PublicHome() {
  const { initialized, session } = useAuth()
  const { data: clinics, isLoading } = useMyClinics()

  if (!initialized) return <BootScreen />

  if (session) {
    if (isLoading) return <BootScreen />
    if (clinics && clinics.length > 0) return <Navigate to="/app/dashboard" replace />
    return <Navigate to="/onboarding" replace />
  }

  return <LandingPage />
}
