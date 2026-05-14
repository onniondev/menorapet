import { motion } from 'framer-motion'
import {
  ArrowRight,
  Bell,
  Calendar,
  DollarSign,
  MessageCircle,
  PawPrint,
  Play,
  Sparkles,
  Star,
  UserPlus,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { gradientButtonClass } from '../components/petvia/gradientButtonStyles'
import { DashboardMockup } from '../components/petvia/DashboardMockup'
import { FeatureCard } from '../components/petvia/FeatureCard'
import { FloatingCard } from '../components/petvia/FloatingCard'
import { FooterPetVia } from '../components/petvia/FooterPetVia'
import { Navbar } from '../components/petvia/Navbar'
import { cn } from '../lib/utils'

const motionEase = [0.22, 1, 0.36, 1] as const

const stats = [
  { label: 'mensagens respondidas pela IA', value: '+230 mil' },
  { label: 'consultas agendadas automaticamente', value: '+98 mil' },
  { label: 'clientes recuperados', value: '+35 mil' },
  { label: 'aumento médio no faturamento', value: '+18%' },
] as const

const features = [
  {
    icon: MessageCircle,
    title: 'Atendimento automático',
    description: 'Triagem, respostas e encaminhamento com contexto da clínica e do pet.',
  },
  {
    icon: Calendar,
    title: 'Agenda inteligente',
    description: 'Confirmações, reagendamentos e visão do dia para toda a equipe.',
  },
  {
    icon: Bell,
    title: 'Lembretes por WhatsApp',
    description: 'Vacinas, retornos e check-ups sem esforço manual da recepção.',
  },
  {
    icon: PawPrint,
    title: 'Gestão de pets',
    description: 'Histórico unificado: tutores, animais, observações e próximos passos.',
  },
  {
    icon: UserPlus,
    title: 'Recuperação de clientes',
    description: 'Reativação com mensagens personalizadas e acompanhamento de retorno.',
  },
  {
    icon: DollarSign,
    title: 'Cobranças automáticas',
    description: 'Fluxos para lembretes de pagamento e organização financeira básica.',
  },
] as const

const outlineBtn = cn(
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-5 text-sm font-bold text-[#0F172A] shadow-sm transition hover:border-[#7C3AED]/35 hover:bg-slate-50 active:scale-[0.98] dark:border-white/10 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800',
)

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#F8FAFC] text-[#0F172A] dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-[0.65] dark:opacity-30">
        <div className="absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-[#7C3AED]/15 blur-3xl" />
        <div className="absolute right-0 top-40 h-[380px] w-[380px] rounded-full bg-[#3B82F6]/12 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full bg-[#22D3C5]/10 blur-3xl" />
      </div>

      <Navbar />

      <main className="relative z-10">
        {/* Hero + produto visual */}
        <section id="produto" className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: motionEase }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/20 bg-white/80 px-3 py-1 text-xs font-bold text-[#7C3AED] shadow-sm backdrop-blur dark:border-[#22D3C5]/30 dark:bg-slate-900/60 dark:text-[#22D3C5]">
                <Sparkles className="h-3.5 w-3.5" />
                IA que trabalha por você, 24h por dia
              </div>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.15rem]">
                Transforme sua clínica em uma{' '}
                <span className="bg-gradient-to-r from-[#7C3AED] via-[#3B82F6] to-[#22D3C5] bg-clip-text text-transparent">
                  operação inteligente.
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#64748B] dark:text-slate-400">
                PetVia é o funcionário digital que atende clientes, agenda consultas, envia lembretes e organiza sua clínica
                veterinária 24h por dia.
              </p>
              <p className="mt-2 text-sm font-semibold italic text-[#64748B] dark:text-slate-500">
                Sua clínica veterinária no automático.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register" className={cn(gradientButtonClass)}>
                  Começar gratuitamente
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#produto" className={outlineBtn}>
                  <Play className="h-4 w-4 fill-current" />
                  Ver demonstração
                </a>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <div className="flex -space-x-2">
                  {['bg-violet-400', 'bg-blue-400', 'bg-teal-400', 'bg-amber-400'].map((c, i) => (
                    <span
                      key={i}
                      className={cn('inline-flex h-9 w-9 rounded-full border-2 border-white ring-1 ring-slate-200/80', c)}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#64748B] dark:text-slate-400">
                  <span className="flex text-[#7C3AED]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-current" />
                    ))}
                  </span>
                  Mais de 1.200 clínicas confiam na PetVia
                </div>
              </div>
            </motion.div>

            <div className="relative mx-auto w-full max-w-lg lg:mx-0">
              <FloatingCard
                title="Consulta confirmada"
                subtitle="Mel · 10:30"
                tone="purple"
                delay={0.25}
                icon={<Zap className="h-4 w-4" />}
                className="-left-2 top-4 z-20 sm:-left-6"
              />
              <FloatingCard
                title="Vacina lembrada"
                subtitle="Luna · V8"
                tone="green"
                delay={0.4}
                icon={<Bell className="h-4 w-4" />}
                className="-right-2 top-1/3 z-20 sm:-right-4"
              />
              <FloatingCard
                title="Cliente recuperado"
                subtitle="Bruno voltou!"
                tone="teal"
                delay={0.55}
                icon={<UserPlus className="h-4 w-4" />}
                className="bottom-24 left-0 z-20 sm:-left-8"
              />
              <FloatingCard
                title="IA respondendo"
                subtitle="WhatsApp · agora"
                tone="blue"
                delay={0.7}
                icon={<MessageCircle className="h-4 w-4" />}
                className="bottom-8 right-0 z-20 sm:-right-6"
              />
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: motionEase }}
                className="relative z-10"
              >
                <DashboardMockup variant="hero" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-slate-200/80 bg-white/70 py-12 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.value} className="text-center">
                <p className="text-3xl font-extrabold tracking-tight text-[#7C3AED] dark:text-[#22D3C5]">{s.value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#64748B] dark:text-slate-400">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Recursos */}
        <section id="recursos" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: motionEase }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Tudo que sua clínica precisa para{' '}
              <span className="relative inline-block">
                crescer
                <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#22D3C5]" />
              </span>
            </h2>
            <p className="mt-3 text-[#64748B] dark:text-slate-400">
              Um painel só — da recepção ao veterinário, com permissões e dados por clínica.
            </p>
          </motion.div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 0.06} />
            ))}
          </div>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" className="border-t border-slate-200/80 bg-gradient-to-b from-white/80 to-[#F8FAFC] py-20 dark:border-white/10 dark:from-slate-900/60 dark:to-slate-950">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Como funciona</h2>
            <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-3">
              {[
                { n: '1', t: 'Conecte sua clínica', d: 'Cadastro, equipe e dados iniciais em minutos com onboarding guiado.' },
                { n: '2', t: 'Ative sua IA', d: 'Defina tom de voz, horários e canais — a IA aprende o fluxo da sua clínica.' },
                { n: '3', t: 'Automatize sua rotina', d: 'Lembretes, agenda e conversas passam a rodar com menos atrito operacional.' },
              ].map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.45, ease: motionEase }}
                  className="relative rounded-3xl border border-white/80 bg-white/90 p-6 text-center shadow-sm dark:border-white/10 dark:bg-slate-900/70"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] text-sm font-extrabold text-white">
                    {step.n}
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold">{step.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#64748B] dark:text-slate-400">{step.d}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Preços (mock) */}
        <section id="precos" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-xl rounded-[2rem] border border-white/80 bg-white/90 p-8 text-center shadow-[0_20px_60px_rgba(124,58,237,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
            <h2 className="text-2xl font-extrabold">Preços sob medida</h2>
            <p className="mt-2 text-sm text-[#64748B] dark:text-slate-400">
              Planos para clínicas solo até redes — fale com a equipe PetVia quando sair do beta.
            </p>
            <Link to="/register" className="mt-6 inline-flex">
              <span className={cn(gradientButtonClass)}>Quero entrar na lista</span>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: motionEase }}
            className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-gradient-to-br from-[#7C3AED] via-[#6366F1] to-[#22D3C5] p-[1px] shadow-[0_28px_80px_rgba(124,58,237,0.25)]"
          >
            <div className="relative rounded-[1.96rem] bg-[#0F172A] px-6 py-14 text-center sm:px-12">
              <div className="pointer-events-none absolute inset-0 opacity-40">
                <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-[#7C3AED] blur-3xl" />
                <div className="absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-[#22D3C5] blur-3xl" />
              </div>
              <h2 className="relative text-2xl font-extrabold text-white sm:text-3xl">Pronto para deixar sua clínica no automático?</h2>
              <p className="relative mx-auto mt-3 max-w-md text-sm text-slate-300">
                Crie sua conta e configure a clínica no onboarding em poucos minutos.
              </p>
              <div className="relative mt-8">
                <Link to="/register" className={cn(gradientButtonClass)}>
                  Criar minha conta
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <FooterPetVia />
    </div>
  )
}
