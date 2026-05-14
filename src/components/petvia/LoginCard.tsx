import type { ReactNode } from 'react'
import { LogoPetVia } from './LogoPetVia'
import { cn } from '../../lib/utils'

type Props = {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function LoginCard({ title, subtitle, children, footer, className }: Props) {
  return (
    <div
      className={cn(
        'w-full max-w-md rounded-[1.75rem] border border-white/90 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/85 dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-8',
        className,
      )}
    >
      <div className="mb-6 flex justify-center">
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#7C3AED]/30 to-[#22D3C5]/25 blur-md" />
          <div className="relative rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] p-0.5">
            <div className="rounded-[0.9rem] bg-white p-2.5 dark:bg-slate-950">
              <LogoPetVia size={44} />
            </div>
          </div>
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs shadow-md">
            ✨
          </span>
        </div>
      </div>
      <h1 className="text-center text-2xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">{title}</h1>
      <p className="mt-1.5 text-center text-sm text-[#64748B] dark:text-slate-400">{subtitle}</p>
      <div className="mt-8">{children}</div>
      {footer ? <div className="mt-6">{footer}</div> : null}
    </div>
  )
}
