import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

const tones = {
  purple: 'border-violet-200/80 bg-white/90 text-[#0F172A] shadow-[0_12px_40px_rgba(124,58,237,0.15)] dark:border-violet-500/20 dark:bg-slate-900/85 dark:text-slate-100',
  teal: 'border-teal-200/80 bg-white/90 text-[#0F172A] shadow-[0_12px_40px_rgba(34,211,197,0.18)] dark:border-teal-500/25 dark:bg-slate-900/85',
  green: 'border-emerald-200/80 bg-emerald-50/95 text-[#065F46] shadow-[0_12px_40px_rgba(16,185,129,0.12)] dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-100',
  blue: 'border-sky-200/80 bg-white/90 text-[#0F172A] shadow-[0_12px_40px_rgba(59,130,246,0.18)] dark:border-sky-500/25 dark:bg-slate-900/85',
} as const

export type FloatingTone = keyof typeof tones

type Props = {
  title: string
  subtitle?: string
  tone?: FloatingTone
  icon?: ReactNode
  className?: string
  delay?: number
}

export function FloatingCard({ title, subtitle, tone = 'purple', icon, className, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'pointer-events-none absolute z-20 max-w-[220px] rounded-2xl border px-3.5 py-2.5 backdrop-blur-md sm:max-w-[240px]',
        tones[tone],
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        {icon ? <div className="mt-0.5 shrink-0 text-[#7C3AED] dark:text-[#22D3C5]">{icon}</div> : null}
        <div className="min-w-0">
          <p className="text-xs font-bold leading-snug">{title}</p>
          {subtitle ? <p className="mt-0.5 text-[10px] font-medium leading-snug text-[#64748B] dark:text-slate-400">{subtitle}</p> : null}
        </div>
      </div>
    </motion.div>
  )
}
