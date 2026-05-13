import type { HTMLAttributes, ReactNode } from 'react'

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }

export function Card({ children, className = '', padding = 'md', ...rest }: Props) {
  return (
    <div
      className={`rounded-3xl border border-slate-200/70 bg-white/80 shadow-[0_8px_30px_rgb(15,23,42,0.06)] backdrop-blur-md dark:border-white/10 dark:bg-slate-900/55 dark:shadow-[0_8px_40px_rgb(0,0,0,0.35)] ${paddings[padding]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
