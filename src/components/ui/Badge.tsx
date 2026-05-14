import type { HTMLAttributes, ReactNode } from 'react'

const tones = {
  neutral: 'bg-slate-900/5 text-slate-700 ring-slate-900/10 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10',
  info: 'bg-brand-blue/10 text-brand-blue ring-brand-blue/20 dark:bg-brand-blue/15 dark:text-brand-blue',
  purple:
    'bg-brand-purple/10 text-brand-purple ring-brand-purple/20 dark:bg-brand-purple/20 dark:text-white dark:ring-brand-purple/30',
  teal: 'bg-brand-teal/10 text-brand-teal ring-brand-teal/20 dark:bg-brand-teal/15 dark:text-brand-teal',
  amber: 'bg-amber-500/10 text-amber-900 ring-amber-500/20 dark:text-amber-200 dark:ring-amber-500/25',
  success:
    'bg-emerald-500/10 text-emerald-900 ring-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-500/25',
  danger: 'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-200 dark:ring-rose-500/25',
} as const

export type BadgeTone = keyof typeof tones

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone
  leftIcon?: ReactNode
}

export function Badge({ tone = 'neutral', leftIcon, className = '', children, ...rest }: Props) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${tones[tone]} ${className}`}
      {...rest}
    >
      {leftIcon ? <span className="shrink-0 opacity-90">{leftIcon}</span> : null}
      <span className="min-w-0 truncate">{children}</span>
    </span>
  )
}
