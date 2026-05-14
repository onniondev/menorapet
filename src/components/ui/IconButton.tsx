import type { ButtonHTMLAttributes, ReactNode } from 'react'

const sizes = {
  sm: 'h-9 w-9 rounded-xl',
  md: 'h-10 w-10 rounded-2xl',
} as const

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  size?: keyof typeof sizes
  children: ReactNode
}

export function IconButton({ label, size = 'md', className = '', children, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center border border-slate-200/85 bg-white/75 text-slate-700 shadow-sm transition hover:border-brand-purple/35 hover:bg-white hover:text-ink active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/35 dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-100 dark:hover:border-brand-purple/35 dark:hover:bg-slate-900 ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
