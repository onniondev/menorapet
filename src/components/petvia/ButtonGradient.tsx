import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { gradientButtonClass } from './gradientButtonStyles'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  loading?: boolean
  rightIcon?: ReactNode
  fullWidth?: boolean
}

export function ButtonGradient({ children, loading, rightIcon, fullWidth, className, disabled, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(gradientButtonClass, fullWidth && 'w-full', className)}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : null}
      <span>{children}</span>
      {!loading && rightIcon ? <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{rightIcon}</span> : null}
    </button>
  )
}
