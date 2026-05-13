import type { ButtonHTMLAttributes, ReactNode } from 'react'

const base =
  'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface dark:focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]'

const variants = {
  primary:
    'bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-lg shadow-brand-purple/25 hover:shadow-xl hover:shadow-brand-purple/30 hover:brightness-[1.03]',
  ghost:
    'bg-transparent text-ink/80 hover:bg-slate-900/5 dark:text-slate-200/90 dark:hover:bg-white/10',
  outline:
    'border border-slate-200/80 bg-white/40 text-ink hover:border-brand-purple/40 hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-brand-purple/40 dark:hover:bg-white/10',
  social:
    'border border-slate-200/80 bg-white/70 text-ink hover:border-brand-purple/30 hover:bg-white dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:bg-slate-800',
} as const

type Variant = keyof typeof variants

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export function Button({
  className = '',
  variant = 'primary',
  loading,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  )
}
