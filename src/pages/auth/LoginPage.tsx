import { ArrowRight, Lock, Mail } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { SupabaseEnvBanner } from '../../components/auth/SupabaseEnvBanner'
import { ButtonGradient } from '../../components/petvia/ButtonGradient'
import { LoginBrandAside } from '../../components/petvia/LoginBrandAside'
import { LoginCard } from '../../components/petvia/LoginCard'
import { ThemeToggle } from '../../components/layout/ThemeToggle'
import { useAuth } from '../../context/AuthContext'
import { Input } from '../../components/ui/Input'
import { cn } from '../../lib/utils'

const socialBtn = cn(
  'flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white py-3 text-sm font-bold text-[#0F172A] shadow-sm transition hover:border-[#7C3AED]/30 hover:bg-slate-50 active:scale-[0.99] dark:border-white/10 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900',
)

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
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

  const socialSoon = () => toast.message('Em breve', { description: 'Integração social disponível numa próxima versão.' })

  return (
    <div className="min-h-dvh bg-[#F8FAFC] text-[#0F172A] dark:bg-slate-950 dark:text-slate-100">
      <div className="grid min-h-dvh lg:grid-cols-2">
        <LoginBrandAside />

        <div className="relative flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-12 lg:py-16">
          <div className="absolute right-4 top-4 flex justify-end sm:right-8 sm:top-8">
            <ThemeToggle />
          </div>

          <div className="mx-auto w-full max-w-md">
            <SupabaseEnvBanner />

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
              <LoginCard
                title="Entrar na PetVia"
                subtitle="Acesse sua clínica para continuar."
                footer={
                  <p className="text-center text-sm text-[#64748B] dark:text-slate-400">
                    <Link to="/" className="font-medium hover:text-[#7C3AED] hover:underline dark:hover:text-[#22D3C5]">
                      ← Voltar ao início
                    </Link>
                    <span className="mx-2 text-slate-300 dark:text-slate-600">·</span>
                    Ainda não tem conta?{' '}
                    <Link to="/register" className="font-bold text-[#7C3AED] hover:underline dark:text-[#22D3C5]">
                      Criar conta
                    </Link>
                  </p>
                }
              >
                <form className="space-y-4" onSubmit={onSubmit}>
                  <Input
                    label="E-mail"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    left={<Mail className="h-4 w-4" />}
                  />
                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-[#0F172A]/85 dark:text-slate-200/90">Senha</span>
                      <Link
                        to="/forgot-password"
                        className="text-xs font-bold text-[#7C3AED] hover:underline dark:text-[#22D3C5]"
                      >
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
                          className="rounded-lg px-1 text-xs font-bold text-[#7C3AED] hover:bg-[#7C3AED]/10 dark:text-[#22D3C5]"
                          onClick={() => setShowPass((v) => !v)}
                        >
                          {showPass ? 'Ocultar' : 'Mostrar'}
                        </button>
                      }
                    />
                  </div>

                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#64748B] dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-[#7C3AED] focus:ring-[#7C3AED]/30"
                    />
                    Lembrar de mim
                  </label>

                  <ButtonGradient type="submit" fullWidth loading={loading} rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Entrar
                  </ButtonGradient>
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs font-bold uppercase tracking-wide text-[#64748B]">
                    <span className="bg-white px-3 dark:bg-slate-900">ou</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button type="button" className={socialBtn} onClick={socialSoon}>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Entrar com Google
                  </button>
                  <button type="button" className={socialBtn} onClick={socialSoon}>
                    <span className="text-lg leading-none text-[#25D366]">●</span>
                    Entrar com WhatsApp
                  </button>
                </div>
              </LoginCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}