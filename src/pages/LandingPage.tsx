import { motion } from 'framer-motion'
import {
  ArrowRight,
  Calendar,
  Check,
  LineChart,
  MessageCircle,
  PawPrint,
  Shield,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PetviaLogo } from '../components/PetviaLogo'
import { ThemeToggle } from '../components/layout/ThemeToggle'
import { cn } from '../lib/utils'

const motionEase = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45, ease: motionEase },
}

const features = [
  {
    icon: Sparkles,
    title: 'IA no atendimento',
    desc: 'Respostas contextuais, triagem e sugestões para sua equipe ganhar tempo.',
  },
  {
    icon: MessageCircle,
    title: 'Conversas centralizadas',
    desc: 'WhatsApp e canais em um só lugar, com histórico por cliente e pet.',
  },
  {
    icon: Calendar,
    title: 'Agenda inteligente',
    desc: 'Confirmações, lembretes e visão do dia para recepção e veterinários.',
  },
  {
    icon: Users,
    title: 'Equipe e permissões',
    desc: 'Papéis claros (owner, admin, vet, recepção) com dados isolados por clínica.',
  },
  {
    icon: PawPrint,
    title: 'Clientes e pets',
    desc: 'Ficha unificada: tutores, animais, anotações e próximos passos.',
  },
  {
    icon: LineChart,
    title: 'Financeiro e automações',
    desc: 'Base pronta para acompanhar receitas e automatizar rotinas recorrentes.',
  },
] as const

const steps = [
  { n: '1', title: 'Crie sua conta', desc: 'Cadastro rápido com e-mail seguro via Supabase Auth.' },
  { n: '2', title: 'Configure a clínica', desc: 'Onboarding guiado: dados, horários e equipe em minutos.' },
  { n: '3', title: 'Atenda com a IA', desc: 'Dashboard, conversas e agenda integrados ao fluxo diário.' },
] as const

const linkPrimary = cn(
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-transparent bg-gradient-to-r from-brand-purple to-brand-blue px-5 text-base font-semibold text-white shadow-[0_10px_30px_rgba(124,58,237,0.28)] transition hover:brightness-[1.02] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/35 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
)

const linkOutline = cn(
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white/55 px-5 text-base font-semibold text-ink shadow-sm transition hover:border-brand-purple/35 hover:bg-white/85 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/35 focus-visible:ring-offset-2 dark:border-white/10 dark:bg-slate-950/35 dark:text-slate-100 dark:hover:bg-slate-900/55 dark:focus-visible:ring-offset-slate-950',
)

const linkOnDark = cn(
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 text-base font-bold text-white backdrop-blur-sm transition hover:bg-white/15 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
)

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-surface text-ink dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none fixed inset-0 petvia-mesh opacity-95" />
      <div className="pointer-events-none fixed inset-0 petvia-noise opacity-35 dark:opacity-20" />

      <header className="sticky top-0 z-50 border-b border-white/50 bg-white/65 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <PetviaLogo size={40} />
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight sm:text-base">Petvia</div>
              <div className="bg-gradient-to-r from-brand-purple to-brand-teal bg-clip-text text-[10px] font-bold uppercase tracking-wider text-transparent sm:text-xs">
                IA para clínicas
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex dark:text-slate-300">
            <a href="#funcionalidades" className="transition hover:text-brand-purple dark:hover:text-brand-teal">
              Funcionalidades
            </a>
            <a href="#como-funciona" className="transition hover:text-brand-purple dark:hover:text-brand-teal">
              Como funciona
            </a>
            <a href="#cta" className="transition hover:text-brand-purple dark:hover:text-brand-teal">
              Começar
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="hidden rounded-2xl border border-slate-200/90 bg-white/60 px-3 py-2 text-xs font-bold text-ink shadow-sm transition hover:border-brand-purple/30 sm:inline-flex dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-brand-purple/40"
            >
              Entrar
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-blue px-3 py-2 text-xs font-bold text-white shadow-[0_10px_28px_rgba(124,58,237,0.35)] transition hover:brightness-[1.03] sm:px-4 sm:text-sm"
            >
              Criar conta
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <motion.div className="lg:col-span-7" {...fadeUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-purple/20 bg-brand-purple/10 px-3 py-1 text-xs font-bold text-brand-purple dark:border-brand-teal/25 dark:bg-brand-teal/10 dark:text-brand-teal">
                <Zap className="h-3.5 w-3.5" />
                Funcionário digital para veterinária
              </div>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.35rem]">
                Atenda mais, com menos{' '}
                <span className="bg-gradient-to-r from-brand-purple via-brand-blue to-brand-teal bg-clip-text text-transparent">
                  atrito operacional
                </span>
                .
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">
                Petvia IA organiza conversas, agenda e equipe em um painel moderno — com autenticação, permissões e dados
                separados por clínica.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/register" className={linkPrimary}>
                  Começar grátis
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className={linkOutline}>
                  Já tenho conta
                </Link>
              </div>
              <ul className="mt-10 flex flex-col gap-3 text-sm font-medium text-slate-600 dark:text-slate-400 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-2">
                {['Supabase Auth + Postgres', 'RLS por clínica', 'UX pensada para recepção'].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="relative lg:col-span-5"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-brand-purple/25 via-brand-blue/15 to-brand-teal/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-white/10">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Hoje</p>
                    <p className="text-lg font-extrabold">Clínica Aurora</p>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-r from-brand-purple to-brand-blue px-3 py-1.5 text-xs font-bold text-white">
                    IA ativa
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    { l: 'Consultas', v: '12', sub: '+2 vs ontem' },
                    { l: 'Respostas IA', v: '48', sub: 'últimas 24h' },
                    { l: 'Confirmações', v: '9', sub: 'WhatsApp' },
                    { l: 'Pets ativos', v: '186', sub: 'cadastro' },
                  ].map((c) => (
                    <div
                      key={c.l}
                      className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/40"
                    >
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{c.l}</p>
                      <p className="mt-1 text-2xl font-extrabold tabular-nums">{c.v}</p>
                      <p className="mt-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{c.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-dashed border-brand-purple/25 bg-brand-purple/[0.06] p-4 dark:border-brand-teal/30 dark:bg-brand-teal/[0.06]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-blue text-white">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Sugestão da IA</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        Oferecer check-up anual para tutores com vacina vencendo em 30 dias — posso montar a mensagem.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="funcionalidades" className="border-y border-white/50 bg-white/40 py-16 dark:border-white/10 dark:bg-slate-950/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <motion.div className="mx-auto max-w-2xl text-center" {...fadeUp}>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Tudo que a clínica precisa para escalar</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-400">
                Módulos integrados — você começa com a base sólida (auth, clínica, equipe) e evolui para clientes, pets e
                agenda no mesmo lugar.
              </p>
            </motion.div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, desc }, i) => (
                <motion.article
                  key={title}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                  className="group rounded-3xl border border-white/60 bg-white/75 p-6 shadow-sm backdrop-blur-xl transition hover:border-brand-purple/25 hover:shadow-[0_16px_50px_rgba(124,58,237,0.12)] dark:border-white/10 dark:bg-slate-900/55 dark:hover:border-brand-teal/30"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple/15 to-brand-teal/15 text-brand-purple dark:text-brand-teal">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{desc}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <motion.div className="mx-auto max-w-2xl text-center" {...fadeUp}>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Do cadastro ao primeiro dia útil</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">Fluxo enxuto para sua equipe não perder tempo com setup.</p>
          </motion.div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                className="relative rounded-3xl border border-white/60 bg-white/70 p-6 text-center dark:border-white/10 dark:bg-slate-900/50"
              >
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple to-brand-blue text-sm font-extrabold text-white">
                  {s.n}
                </div>
                <h3 className="mt-4 text-lg font-extrabold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="cta" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-gradient-to-br from-brand-purple via-brand-blue to-brand-teal p-[1px] shadow-[0_24px_80px_rgba(124,58,237,0.25)]"
          >
            <div className="relative rounded-[1.96rem] bg-slate-950 px-6 py-12 text-center sm:px-12 sm:py-14">
              <div className="pointer-events-none absolute inset-0 opacity-40">
                <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-brand-purple blur-3xl" />
                <div className="absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-brand-teal blur-3xl" />
              </div>
              <Shield className="relative mx-auto h-10 w-10 text-brand-teal" />
              <h2 className="relative mt-4 text-2xl font-extrabold text-white sm:text-3xl">Pronto para modernizar o atendimento?</h2>
              <p className="relative mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">
                Crie sua conta, configure a clínica no onboarding e entre no dashboard em poucos minutos.
              </p>
              <div className="relative mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/register" className={linkPrimary}>
                  Criar conta grátis
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className={linkOnDark}>
                  Entrar
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/50 bg-white/50 py-10 text-center text-sm text-slate-500 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <PetviaLogo size={28} />
            <span className="font-bold text-ink dark:text-slate-200">Petvia IA</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 font-semibold">
            <Link to="/login" className="hover:text-brand-purple dark:hover:text-brand-teal">
              Entrar
            </Link>
            <Link to="/register" className="hover:text-brand-purple dark:hover:text-brand-teal">
              Registrar
            </Link>
            <a href="#funcionalidades" className="hover:text-brand-purple dark:hover:text-brand-teal">
              Funcionalidades
            </a>
          </div>
          <p className="text-xs sm:text-sm">© {new Date().getFullYear()} Petvia IA. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
