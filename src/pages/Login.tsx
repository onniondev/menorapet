import {
  Apple,
  ArrowRight,
  Calendar,
  Heart,
  Lock,
  Mail,
  MessageCircle,
  Sparkles,
} from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PetviaLogo } from '../components/PetviaLogo'
import { ThemeToggle } from '../components/layout/ThemeToggle'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

const floating = [
  { title: 'Atendimento inteligente', icon: MessageCircle, className: 'animate-float-soft' },
  { title: 'Agenda automática', icon: Calendar, className: 'animate-float-soft-delayed' },
  { title: 'Lembretes de retorno', icon: Sparkles, className: 'animate-float-soft' },
  { title: 'Clientes bem cuidados', icon: Heart, className: 'animate-float-soft-delayed' },
] as const

const IMG_DOG =
  'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=700&q=80'
const IMG_CAT =
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=700&q=80'

export default function Login() {
  const navigate = useNavigate()
  const { login, user } = useAuth()
  const [email, setEmail] = useState('ana.aurora@petvia.app')
  const [password, setPassword] = useState('demo123')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    window.setTimeout(() => {
      login(email.trim() || 'equipe@petvia.app')
      setLoading(false)
      navigate('/app/dashboard', { replace: true })
    }, 650)
  }

  if (user) {
    return <Navigate to="/app/dashboard" replace />
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-surface text-ink dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-purple/15 blur-3xl dark:bg-brand-purple/25" />
        <div className="absolute -right-24 top-40 h-96 w-96 rounded-full bg-brand-blue/15 blur-3xl dark:bg-brand-blue/20" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-brand-teal/10 blur-3xl dark:bg-brand-teal/15" />
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.22]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgb(15 23 42 / 0.12) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto grid min-h-dvh w-full max-w-6xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8">
        <section className="order-2 flex flex-col justify-center lg:order-1">
          <div className="mb-6 flex items-center justify-between lg:justify-start lg:gap-4">
            <div className="flex items-center gap-3">
              <PetviaLogo size={48} />
              <div className="leading-tight">
                <div className="text-lg font-extrabold tracking-tight">Petvia</div>
                <div className="bg-gradient-to-r from-brand-purple to-brand-teal bg-clip-text text-sm font-bold text-transparent">
                  IA
                </div>
              </div>
            </div>
            <ThemeToggle className="lg:hidden" />
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand-purple/10 via-brand-blue/10 to-brand-teal/10 blur-2xl dark:from-brand-purple/20 dark:via-brand-blue/15 dark:to-brand-teal/10" />

            <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
              Sua clínica no automático.
            </h2>
            <p className="mt-3 max-w-xl text-pretty text-lg font-semibold sm:text-xl">
              <span className="bg-gradient-to-r from-brand-teal to-brand-blue bg-clip-text text-transparent">
                Mais tempo para cuidar.
              </span>
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              O funcionário digital que atende, agenda e organiza sua clínica veterinária 24h por dia.
            </p>

            <div className="relative mt-10">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-72 w-72 rounded-full bg-gradient-to-tr from-brand-purple/25 via-brand-blue/20 to-brand-teal/20 blur-2xl dark:opacity-90" />
                <div className="absolute h-[22rem] w-[22rem] rounded-full border border-dashed border-slate-300/60 opacity-60 animate-orbit-slow dark:border-white/10" />
              </div>

              <div className="relative mx-auto flex max-w-md items-end justify-center gap-3 pt-4">
                <div className="hidden w-16 flex-col gap-3 sm:flex">
                  {floating.slice(0, 2).map(({ title, icon: Icon, className }) => (
                    <div
                      key={title}
                      className={`rounded-2xl border border-white/60 bg-white/70 px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/55 dark:text-slate-100 dark:shadow-black/30 ${className}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-blue text-white">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="leading-snug">{title}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative flex w-[min(92vw,420px)] items-end justify-center">
                  <img
                    src={IMG_DOG}
                    alt="Cachorro"
                    className="relative z-[1] h-44 w-44 translate-x-4 rounded-3xl object-cover shadow-2xl shadow-slate-900/15 ring-4 ring-white/70 sm:h-52 sm:w-52 dark:ring-slate-900/70"
                    loading="lazy"
                  />
                  <img
                    src={IMG_CAT}
                    alt="Gato"
                    className="relative z-[2] -ml-10 h-44 w-44 rounded-3xl object-cover shadow-2xl shadow-slate-900/15 ring-4 ring-white/70 sm:h-52 sm:w-52 dark:ring-slate-900/70"
                    loading="lazy"
                  />
                  <div className="absolute -top-2 right-6 z-[3] inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-teal opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-teal" />
                    </span>
                    IA ativa
                  </div>
                </div>

                <div className="hidden w-16 flex-col gap-3 sm:flex">
                  {floating.slice(2).map(({ title, icon: Icon, className }) => (
                    <div
                      key={title}
                      className={`rounded-2xl border border-white/60 bg-white/70 px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/55 dark:text-slate-100 dark:shadow-black/30 ${className}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-teal text-white">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="leading-snug">{title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-slate-200/70 bg-white/60 px-4 py-3 text-sm text-slate-600 shadow-inner backdrop-blur-md dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-300">
                Seguro, confiável e feito para veterinários modernos — com foco em experiência do tutor e da equipe.
              </div>
            </div>
          </div>
        </section>

        <section className="order-1 flex items-center justify-center lg:order-2">
          <div className="relative w-full max-w-md">
            <div className="absolute -right-6 -top-6 hidden lg:block">
              <ThemeToggle />
            </div>

            <Card padding="lg" className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-purple/10 via-transparent to-brand-teal/10" />

              <div className="relative mx-auto mb-6 flex w-fit flex-col items-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-purple to-brand-blue opacity-40 blur-xl" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple via-brand-blue to-brand-teal shadow-lg ring-4 ring-white/70 dark:ring-slate-900/70">
                    <PetviaLogo size={52} />
                  </div>
                </div>
                <h3 className="mt-5 text-center text-xl font-extrabold tracking-tight">Bem-vindo de volta 👋</h3>
                <p className="mt-1 text-center text-sm text-slate-600 dark:text-slate-400">Acesse sua clínica para continuar</p>
              </div>

              <form className="relative space-y-4" onSubmit={onSubmit}>
                <Input
                  label="E-mail ou telefone"
                  name="email"
                  autoComplete="username"
                  placeholder="seu@email.com ou (11) 99999-9999"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  left={<Mail className="h-4 w-4" />}
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-ink/80 dark:text-slate-200/90">Senha</span>
                    <button
                      type="button"
                      className="text-xs font-semibold text-brand-purple hover:underline"
                      onClick={() => {}}
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <Input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
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

                <Button type="submit" className="w-full py-3 text-base" loading={loading} rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Entrar
                </Button>

                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-white/15" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ou continue com</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-white/15" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button type="button" variant="social" className="py-3" aria-label="Google">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                      <path
                        fill="currentColor"
                        d="M21.35 11.1H12v2.9h5.35c-.23 1.2-1.4 3.5-5.35 3.5-3.22 0-5.85-2.66-5.85-5.9s2.63-5.9 5.85-5.9c1.84 0 3.07.78 3.77 1.45l2.58-2.5C16.23 4.45 14.17 3.5 12 3.5 6.98 3.5 2.9 7.58 2.9 12.6s4.08 9.1 9.1 9.1c5.27 0 8.77-3.7 8.77-8.9 0-.6-.06-1.05-.14-1.7z"
                      />
                    </svg>
                  </Button>
                  <Button type="button" variant="social" className="py-3" aria-label="Apple">
                    <Apple className="h-5 w-5" />
                  </Button>
                  <Button type="button" variant="social" className="py-3" aria-label="WhatsApp">
                    <MessageCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </Button>
                </div>

                <p className="pt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                  Ainda não tem conta?{' '}
                  <button type="button" className="font-semibold text-transparent bg-gradient-to-r from-brand-purple to-brand-teal bg-clip-text hover:opacity-90">
                    Criar conta gratuita
                  </button>
                </p>
              </form>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
