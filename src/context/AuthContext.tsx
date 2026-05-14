import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useClinicStore } from '../stores/clinicStore'
import type { Profile } from '../types/app'

type AuthContextValue = {
  initialized: boolean
  session: Session | null
  user: User | null
  profile: Profile | null
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [initialized, setInitialized] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    if (!error && data) setProfile(data as Profile)
    else setProfile(null)
  }, [])

  useEffect(() => {
    let mounted = true

    async function init() {
      if (!supabase) {
        if (mounted) setInitialized(true)
        return
      }
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(data.session ?? null)
      if (data.session?.user) await fetchProfile(data.session.user.id)
      setInitialized(true)
    }

    void init()

    if (!supabase) {
      return () => {
        mounted = false
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      setSession(sess)
      if (sess?.user) await fetchProfile(sess.user.id)
      else {
        setProfile(null)
        useClinicStore.getState().reset()
        queryClient.removeQueries({ queryKey: ['my-clinics'] })
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [fetchProfile, queryClient])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env' }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    return { error: error?.message ?? null }
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    if (!supabase) return { error: 'Supabase não configurado.' }
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    })
    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    useClinicStore.getState().reset()
    queryClient.removeQueries({ queryKey: ['my-clinics'] })
    await supabase.auth.signOut()
  }, [queryClient])

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) return { error: 'Supabase não configurado.' }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`,
    })
    return { error: error?.message ?? null }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (session?.user) await fetchProfile(session.user.id)
  }, [session, fetchProfile])

  const value = useMemo(
    () => ({
      initialized,
      session,
      user: session?.user ?? null,
      profile,
      signIn,
      signUp,
      signOut,
      resetPassword,
      refreshProfile,
    }),
    [initialized, session, profile, signIn, signUp, signOut, resetPassword, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
