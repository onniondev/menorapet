import type { InputHTMLAttributes, ReactNode } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  left?: ReactNode
  right?: ReactNode
}

export function Input({ label, hint, left, right, className = '', id, ...rest }: Props) {
  const inputId = id ?? rest.name

  return (
    <label className="block w-full" htmlFor={inputId}>
      {label ? (
        <span className="mb-1.5 block text-sm font-medium text-ink/80 dark:text-slate-200/90">{label}</span>
      ) : null}
      <div
        className={`flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200/85 bg-white/75 px-3.5 py-2 shadow-inner shadow-slate-900/[0.04] transition focus-within:border-brand-purple/45 focus-within:ring-2 focus-within:ring-brand-purple/20 dark:border-white/10 dark:bg-slate-950/40 dark:shadow-none ${className}`}
      >
        {left ? <span className="text-slate-400 dark:text-slate-500">{left}</span> : null}
        <input
          id={inputId}
          className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
          {...rest}
        />
        {right ? <span className="shrink-0 text-slate-400 dark:text-slate-500">{right}</span> : null}
      </div>
      {hint ? <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{hint}</span> : null}
    </label>
  )
}
