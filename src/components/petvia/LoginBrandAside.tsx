import { motion } from 'framer-motion'
import { Bot, CheckCircle2, MessageCircle, Sparkles } from 'lucide-react'
import { DashboardMockup } from './DashboardMockup'
import { FloatingCard } from './FloatingCard'
import { LogoPetVia } from './LogoPetVia'
import { PetSilhouetteDuo } from './PetSilhouetteDuo'

export function LoginBrandAside() {
  return (
    <div className="relative flex min-h-[320px] flex-col overflow-hidden bg-gradient-to-br from-[#F8FAFC] via-white to-[#EEF2FF] px-8 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 lg:min-h-dvh lg:justify-center lg:px-12 lg:py-16">
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.35]" aria-hidden>
        <defs>
          <linearGradient id="wave" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#7C3AED" stopOpacity="0.2" />
            <stop offset="1" stopColor="#22D3C5" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <path
          d="M0 180 Q 200 120 400 160 T 800 140 L 800 400 L 0 400 Z"
          fill="url(#wave)"
          className="dark:opacity-50"
        />
      </svg>
      <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-[#7C3AED]/10 blur-3xl dark:bg-[#7C3AED]/20" />
      <div className="pointer-events-none absolute -left-16 bottom-32 h-64 w-64 rounded-full bg-[#22D3C5]/10 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-lg">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <LogoPetVia size={48} withWordmark />
          <h2 className="mt-8 text-3xl font-extrabold leading-[1.15] tracking-tight text-[#0F172A] dark:text-white lg:text-4xl">
            Bem-vindo ao futuro da{' '}
            <span className="bg-gradient-to-r from-[#7C3AED] via-[#3B82F6] to-[#22D3C5] bg-clip-text text-transparent">
              gestão veterinária.
            </span>
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-[#64748B] dark:text-slate-400">
            Atenda, agende e organize sua clínica com uma <span className="font-bold text-[#3B82F6]">IA</span> que trabalha
            por você.
          </p>
        </motion.div>

        <div className="relative mx-auto mt-10 max-w-md lg:mt-14">
          <FloatingCard
            title="IA ativa"
            subtitle="Respondendo clientes agora mesmo…"
            tone="blue"
            delay={0.2}
            icon={<Bot className="h-4 w-4" />}
            className="-top-2 right-0 sm:-right-4"
          />
          <FloatingCard
            title="Consulta confirmada"
            subtitle="Mel · 10:30"
            tone="purple"
            delay={0.35}
            icon={<CheckCircle2 className="h-4 w-4" />}
            className="left-0 top-[38%] sm:-left-6"
          />
          <FloatingCard
            title="Vacina lembrada"
            subtitle="Luna · V8"
            tone="green"
            delay={0.5}
            icon={<Sparkles className="h-4 w-4" />}
            className="bottom-[18%] left-2 sm:left-0"
          />
          <FloatingCard
            title="Cliente recuperado"
            subtitle="Bruno voltou!"
            tone="teal"
            delay={0.65}
            icon={<MessageCircle className="h-4 w-4" />}
            className="bottom-0 right-0 sm:-right-2"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <DashboardMockup variant="compact" />
          </motion.div>
        </div>

        <PetSilhouetteDuo />
      </div>
    </div>
  )
}
