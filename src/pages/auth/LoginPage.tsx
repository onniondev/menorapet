import { ArrowRight, Lock, Mail } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { PetviaLogo } from '../../components/PetviaLogo'
import { ThemeToggle } from '../../components/layout/ThemeToggle'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Login realizado')
    navigate('/app/dashboard', { replace: true })
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-surface text-ink dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 petvia-mesh opacity-90" />
      <div className="pointer-events-none absolute inset-0 petvia-noise opacity-40 dark:opacity-25" />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PetviaLogo size={48} />
            <div>
              <div className="text-lg font-extrabold">Petvia</div>
              <div className="bg-gradient-to-r from-brand-purple to-brand-teal bg-clip-text text-xs font-bold text-transparent">IA</div>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {!isSupabaseConfigured ? (
          <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
            <p className="font-semibold">Supabase não configurado neste ambiente</p>
            <p className="mt-2 text-xs leading-relaxed opacity-95">
              {import.meta.env.DEV ? (
                <>
                  Na <strong>raiz do repositório</strong>, crie ou edite{' '}
                  <code className="rounded bg-black/5 px-1 dark:bg-white/10">.env.local</code> com{' '}
                  <code className="rounded bg-black/5 px-1 dark:bg-white/10">VITE_SUPABASE_URL</code> e{' '}
                  <code className="rounded bg-black/5 px-1 dark:bg-white/10">VITE_SUPABASE_ANON_KEY</code>, depois{' '}
                  <strong>pare e rode de novo</strong> <code className="rounded bg-black/5 px-1 dark:bg-white/10">npm run dev</code>{' '}
                  (o Vite só lê o .env ao subir o servidor).
                </>
              ) : (
                <>
                  Em produção, defina <code className="rounded bg-black/5 px-1 dark:bg-white/10">VITE_SUPABASE_URL</code> e{' '}
                  <code className="rounded bg-black/5 px-1 dark:bg-white/10">VITE_SUPABASE_ANON_KEY</code> no painel da hospedagem e faça um{' '}
                  <strong>novo build/deploy</strong> (valores não vêm do seu .env local).
                </>
              )}
            </p>
          </div>
        ) : null}

        <Card padding="lg">
          <h1 className="text-xl font-extrabold tracking-tight">Entrar</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Acesse sua conta Petvia IA</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
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
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink/80 dark:text-slate-200/90">Senha</span>
                <Link to="/forgot-password" className="text-xs font-semibold text-brand-purple hover:underline dark:text-brand-teal">
                  Esqueci minha senha
                </Link>
              </div>
              <Input
                name="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                left={<Lock className="h-4 w-4" />}
                right={
                  <button
                    type="button"
                    className="rounded-lg px-1 text-xs font-semibold text-brand-purple hover:bg-brand-purple/10"
                    onClick={() => setShowPass((v) => !v)}
                  >
                    {showPass ? 'Ocultar' : 'Mostrar'}
                  </button>
                }
              />
            </div>
            <Button type="submit" fullWidth size="lg" loading={loading} rightIcon={<ArrowRight className="h-4 w-4" />}>
              Entrar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Não tem conta?{' '}
            <Link to="/register" className="font-bold text-brand-purple hover:underline dark:text-brand-teal">
              Criar conta
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
