/* eslint-disable react-refresh/only-export-components -- re-exporta primitivos Radix como no shadcn/ui */
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export const Select = SelectPrimitive.Root
export const SelectGroup = SelectPrimitive.Group
export const SelectValue = SelectPrimitive.Value

export function SelectTrigger({ className, children, ...props }: SelectPrimitive.SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        'flex h-11 w-full items-center justify-between gap-2 rounded-2xl border border-slate-200/90 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-300 focus-visible:border-brand-purple/40 focus-visible:ring-2 focus-visible:ring-brand-purple/20 data-[placeholder]:text-slate-400 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-100',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export function SelectContent({ className, children, ...props }: SelectPrimitive.SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          'z-[100] max-h-[min(60vh,320px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-xl dark:border-white/10 dark:bg-slate-900',
          className,
        )}
        position="popper"
        sideOffset={6}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

export function SelectItem({ className, children, ...props }: SelectPrimitive.SelectItemProps) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-xl py-2 pl-8 pr-2 text-sm font-medium text-slate-800 outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-slate-100 data-[state=checked]:bg-brand-purple/10 dark:text-slate-100 dark:data-[highlighted]:bg-slate-800 dark:data-[state=checked]:bg-brand-purple/20',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-3.5 w-3.5 text-brand-purple" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children as ReactNode}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}
