import { Navigate, Outlet } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useMyClinics } from '../../hooks/useMyClinics'

export function RequireClinic() {
  const hasSupabase = Boolean(supabase)
  const { data: clinics, isLoading, isError } = useMyClinics()

  if (!hasSupabase) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Supabase não configurado.</p>
        <p className="text-xs text-slate-500">Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em .env.local</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface petvia-mesh dark:bg-slate-950">
        <div className="rounded-3xl border border-white/60 bg-white/70 px-6 py-4 text-sm font-semibold text-slate-600 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300">
          Carregando sua clínica…
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Não foi possível carregar as clínicas.</p>
        <p className="text-xs text-slate-500">Verifique o projeto Supabase e as policies RLS.</p>
      </div>
    )
  }

  if (!clinics?.length) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
