import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type User = {
  name: string
  role: string
  clinic: string
}

type AuthContextValue = {
  user: User | null
  login: (email: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback((email: string) => {
    const display =
      email.includes('@') && !email.startsWith('@')
        ? email.split('@')[0]?.replace(/\./g, ' ') ?? 'Equipe'
        : 'Equipe Petvia'
    setUser({
      name: display.replace(/\b\w/g, (c) => c.toUpperCase()),
      role: 'Administradora',
      clinic: 'Clínica Veterinária Aurora',
    })
  }, [])

  const logout = useCallback(() => setUser(null), [])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
