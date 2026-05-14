import type { HTMLAttributes, ReactNode } from 'react'

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }

export function Card({ children, className = '', padding = 'md', ...rest }: Props) {
  return (
    <div
      className={`rounded-3xl border border-slate-200/70 bg-white/75 shadow-[0_10px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl ring-1 ring-white/60 dark:border-white/10 dark:bg-slate-900/55 dark:shadow-[0_12px_50px_rgba(0,0,0,0.45)] dark:ring-white/5 ${paddings[padding]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
