import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '../../lib/utils'

export function Label({ className, ...props }: LabelPrimitive.LabelProps) {
  return (
    <LabelPrimitive.Root className={cn('text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400', className)} {...props} />
  )
}
