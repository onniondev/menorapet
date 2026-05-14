import { useQuery } from '@tanstack/react-query'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'

const marketingDemoLocal = import.meta.env.VITE_MARKETING_IA_DEMO === '1'

function usePetviaAdminGate() {
  const { session, initialized } = useAuth()
  const uid = session?.user.id

  return useQuery({
    queryKey: ['petvia-admin-gate', uid],
    enabled: Boolean(initialized && uid && isSupabaseConfigured && supabase),
    queryFn: async () => {
      const { data, error } = await supabase!.from('petvia_admins').select('user_id').eq('user_id', uid!).maybeSingle()
      if (error) throw new Error(error.message)
      return Boolean(data)
    },
  })
}

export function RequirePetviaAdmin() {
  const { session, initialized } = useAuth()
  const q = usePetviaAdminGate()

  if (!initialized) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Carregando…</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: '/marketing-ia' }} />
  }

  if (!isSupabaseConfigured || !supabase) {
    if (marketingDemoLocal) {
      return <Outlet />
    }
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Configure o Supabase para acessar o Marketing IA.</p>
        <p className="text-xs text-slate-500">Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em .env.local</p>
        <p className="text-xs text-slate-400">Dev: defina VITE_MARKETING_IA_DEMO=1 para ver o módulo com dados mock.</p>
      </div>
    )
  }

  if (q.isLoading || q.isFetching) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Verificando permissões…</p>
      </div>
    )
  }

  if (q.isError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-sm font-semibold text-red-600">Não foi possível verificar admin.</p>
        <p className="text-xs text-slate-500">{(q.error as Error).message}</p>
      </div>
    )
  }

  if (!q.data) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <Outlet />
}
