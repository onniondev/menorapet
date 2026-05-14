import { cn } from '../../lib/utils'

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className, ...props }: Props) {
  return (
    <textarea
      className={cn(
        'min-h-[120px] w-full resize-y rounded-2xl border border-slate-200/90 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus-visible:border-brand-purple/40 focus-visible:ring-2 focus-visible:ring-brand-purple/20 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-100',
        className,
      )}
      {...props}
    />
  )
}
