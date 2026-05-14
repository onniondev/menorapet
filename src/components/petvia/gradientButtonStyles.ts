import { cn } from '../../lib/utils'

export const gradientButtonClass = cn(
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-transparent bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#3B82F6] px-6 text-sm font-bold text-white shadow-[0_14px_40px_rgba(124,58,237,0.35)] transition-all duration-200 hover:shadow-[0_18px_48px_rgba(59,130,246,0.35)] hover:brightness-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAFC] disabled:pointer-events-none disabled:opacity-55 dark:focus-visible:ring-offset-slate-950',
)
