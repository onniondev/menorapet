import { ArrowRight, Lock, Mail, User } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { PetviaLogo } from '../../components/PetviaLogo'
import { ThemeToggle } from '../../components/layout/ThemeToggle'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'

export default function RegisterPage() {
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signUp(email, password, fullName)
    setLoading(false)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Conta criada. Verifique seu e-mail se a confirmação estiver ativa no Supabase.')
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-surface text-ink dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 petvia-mesh opacity-90" />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PetviaLogo size={48} />
            <div className="text-lg font-extrabold">Petvia IA</div>
          </div>
          <ThemeToggle />
        </div>

        {!isSupabaseConfigured ? (
          <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
            <p className="font-semibold">Supabase não configurado neste ambiente</p>
            <p className="mt-2 text-xs leading-relaxed opacity-95">
              {import.meta.env.DEV ? (
                <>
                  Use <code className="rounded bg-black/5 px-1 dark:bg-white/10">.env.local</code> na raiz com{' '}
                  <code className="rounded bg-black/5 px-1 dark:bg-white/10">VITE_SUPABASE_URL</code> e{' '}
                  <code className="rounded bg-black/5 px-1 dark:bg-white/10">VITE_SUPABASE_ANON_KEY</code> e reinicie{' '}
                  <code className="rounded bg-black/5 px-1 dark:bg-white/10">npm run dev</code>.
                </>
              ) : (
                <>
                  Defina as variáveis <code className="rounded bg-black/5 px-1 dark:bg-white/10">VITE_*</code> no painel da hospedagem e refaça o deploy.
                </>
              )}
            </p>
          </div>
        ) : null}

        <Card padding="lg">
          <h1 className="text-xl font-extrabold tracking-tight">Criar conta</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Comece com sua clínica em minutos</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <Input
              label="Nome completo"
              name="fullName"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              left={<User className="h-4 w-4" />}
            />
            <Input
              label="E-mail"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              left={<Mail className="h-4 w-4" />}
            />
            <Input
              label="Senha"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              left={<Lock className="h-4 w-4" />}
            />
            <Button type="submit" fullWidth size="lg" loading={loading} rightIcon={<ArrowRight className="h-4 w-4" />}>
              Cadastrar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            <Link to="/" className="font-medium text-slate-500 hover:text-brand-purple hover:underline dark:text-slate-500 dark:hover:text-brand-teal">
              ← Voltar ao início
            </Link>
            {' · '}
            Já tem conta?{' '}
            <Link to="/login" className="font-bold text-brand-purple hover:underline dark:text-brand-teal">
              Entrar
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
