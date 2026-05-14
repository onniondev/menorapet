import type { ButtonHTMLAttributes, ReactNode } from 'react'

const base =
  'box-border inline-flex max-w-full items-center gap-2 font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50 active:scale-[0.985] dark:focus-visible:ring-offset-slate-950'

const sizes = {
  sm: 'min-h-9 rounded-xl px-3 py-2 text-xs',
  md: 'min-h-11 rounded-2xl px-4 py-2.5 text-sm',
  lg: 'min-h-12 rounded-2xl px-5 py-3 text-base',
} as const

const variants = {
  primary:
    'border border-transparent bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-[0_10px_30px_rgba(124,58,237,0.28)] hover:shadow-[0_14px_40px_rgba(59,130,246,0.28)] hover:brightness-[1.02]',
  ghost:
    'border border-transparent bg-transparent text-ink/85 hover:bg-slate-900/[0.04] dark:text-slate-100/90 dark:hover:bg-white/[0.06]',
  outline:
    'border border-slate-200/90 bg-white/55 text-ink shadow-sm hover:border-brand-purple/35 hover:bg-white/85 dark:border-white/10 dark:bg-slate-950/35 dark:text-slate-100 dark:hover:border-brand-purple/35 dark:hover:bg-slate-900/55',
  social:
    'border border-slate-200/90 bg-white/70 text-ink shadow-sm hover:border-brand-purple/30 hover:bg-white dark:border-white/10 dark:bg-slate-900/45 dark:text-slate-100 dark:hover:bg-slate-900/70',
} as const

type Variant = keyof typeof variants
type Size = keyof typeof sizes

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
  align?: 'center' | 'between'
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export function Button({
  className = '',
  variant = 'primary',
  size = 'md',
  loading,
  fullWidth,
  align = 'center',
  leftIcon,
  rightIcon,
  children,
  disabled,
  type = 'button',
  ...rest
}: Props) {
  const spinner =
    variant === 'primary' ? (
      <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
    ) : (
      <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-brand-purple/25 border-t-brand-purple" />
    )

  return (
    <button
      type={type}
      className={`${base} ${align === 'between' ? 'justify-between' : 'justify-center'} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? spinner : leftIcon ? <span className="inline-flex shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4">{leftIcon}</span> : null}
      {children != null && children !== false ? (
        <span className={`min-w-0 leading-snug ${align === 'between' ? 'flex-1 text-left' : 'text-center'}`}>{children}</span>
      ) : null}
      {!loading && rightIcon ? (
        <span className="inline-flex shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4">{rightIcon}</span>
      ) : null}
    </button>
  )
}
