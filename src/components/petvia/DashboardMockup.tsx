import { motion } from 'framer-motion'
import {
  Calendar,
  Home,
  LayoutGrid,
  MessageCircle,
  PawPrint,
  Sparkles,
  Users,
} from 'lucide-react'
import { cn } from '../../lib/utils'

type Props = {
  variant?: 'hero' | 'compact'
  className?: string
}

export function DashboardMockup({ variant = 'hero', className }: Props) {
  const compact = variant === 'compact'

  return (
    <motion.div
      layout
      className={cn(
        'relative overflow-hidden rounded-[1.35rem] border border-white/90 bg-white/95 shadow-[0_28px_80px_rgba(15,23,42,0.1)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_28px_80px_rgba(0,0,0,0.5)]',
        compact ? 'text-[11px]' : 'text-xs sm:text-sm',
        className,
      )}
    >
      <div className="flex min-h-[200px] sm:min-h-[240px]">
        {/* Sidebar */}
        <div className="flex w-11 shrink-0 flex-col items-center gap-2 border-r border-slate-100 bg-slate-50/90 py-3 dark:border-white/10 dark:bg-slate-950/60 sm:w-14 sm:gap-2.5 sm:py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] text-white shadow-md sm:h-9 sm:w-9">
            <Home className="h-4 w-4" />
          </span>
          {[MessageCircle, Calendar, Users, PawPrint].map((Ic, i) => (
            <span
              key={i}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-[#7C3AED] dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-[#22D3C5] sm:h-9 sm:w-9"
            >
              <Ic className="h-4 w-4" />
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 dark:border-white/10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">Dashboard</p>
              <p className={cn('font-extrabold text-[#0F172A] dark:text-white', compact ? 'text-xs' : 'text-sm sm:text-base')}>
                Bom dia, Dra. Juliana! <span className="inline-block animate-float-soft">👋</span>
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#22D3C5] px-2 py-0.5 text-[9px] font-bold text-white sm:text-[10px]">
              IA ativa
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-3 gap-1.5 sm:gap-2">
            {[
              { l: 'Consultas', v: '12', c: 'text-[#3B82F6]' },
              { l: 'Mensagens', v: '8', c: 'text-[#7C3AED]' },
              { l: 'Retornos', v: '5', c: 'text-[#22D3C5]' },
            ].map((x) => (
              <div
                key={x.l}
                className="rounded-xl border border-slate-100 bg-slate-50/80 px-1.5 py-1.5 dark:border-white/10 dark:bg-slate-950/50 sm:px-2 sm:py-2"
              >
                <p className="text-[9px] font-semibold text-[#64748B] sm:text-[10px]">{x.l}</p>
                <p className={cn('text-base font-extrabold tabular-nums sm:text-lg', x.c)}>{x.v}</p>
              </div>
            ))}
          </div>

          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-white p-2 dark:border-white/10 dark:bg-slate-950/40">
              <p className="mb-1 flex items-center gap-1 text-[10px] font-bold text-[#0F172A] dark:text-white">
                <Calendar className="h-3 w-3 text-[#3B82F6]" />
                Agenda do dia
              </p>
              <ul className="space-1 text-[9px] font-medium text-[#64748B] dark:text-slate-400 sm:text-[10px]">
                <li className="flex justify-between gap-1">
                  <span>Thor · Consulta</span>
                  <span className="shrink-0 rounded-md bg-[#22D3C5]/15 px-1 text-[#0F766E] dark:text-[#22D3C5]">Confirmada</span>
                </li>
                <li className="flex justify-between gap-1">
                  <span>Luna · Retorno</span>
                  <span className="shrink-0 text-slate-400">10:30</span>
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-dashed border-[#7C3AED]/25 bg-gradient-to-br from-[#7C3AED]/[0.06] to-[#22D3C5]/[0.06] p-2 dark:border-[#22D3C5]/30">
              <p className="mb-1 flex items-center gap-1 text-[10px] font-bold text-[#0F172A] dark:text-white">
                <Sparkles className="h-3 w-3 text-[#7C3AED]" />
                Alertas inteligentes
              </p>
              <p className="text-[9px] leading-snug text-[#64748B] dark:text-slate-400 sm:text-[10px]">
                Vacina da Luna vence hoje — enviar lembrete?
              </p>
            </div>
          </div>

          {!compact ? (
            <div className="mt-2.5 rounded-xl border border-slate-100 bg-slate-50/80 p-2 dark:border-white/10 dark:bg-slate-950/40">
              <p className="mb-1 text-[10px] font-bold text-[#0F172A] dark:text-white">WhatsApp</p>
              <div className="rounded-lg bg-white p-2 text-[9px] shadow-sm dark:bg-slate-900">
                <p className="font-semibold text-[#0F172A] dark:text-white">Jessica</p>
                <p className="mt-0.5 text-[#64748B] dark:text-slate-400">Oi! Queria marcar uma consulta para o Thor 🐕</p>
                <p className="mt-1 text-[9px] italic text-[#7C3AED]">IA está digitando…</p>
              </div>
            </div>
          ) : null}

          <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-2 py-1.5 dark:border-white/10 dark:bg-slate-950/50">
            <LayoutGrid className="h-3.5 w-3.5 text-[#64748B]" />
            <span className="text-[9px] font-medium text-[#64748B] dark:text-slate-400">Pets cadastrados · 186 ativos</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
