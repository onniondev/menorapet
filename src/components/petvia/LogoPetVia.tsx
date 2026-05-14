import { useId } from 'react'
import { cn } from '../../lib/utils'

type Props = {
  className?: string
  size?: number
  /** Mostra o wordmark “PetVia” ao lado do ícone */
  withWordmark?: boolean
}

/** Logo SVG: patinha + brilho (IA), cantos arredondados, gradiente premium. */
export function LogoPetVia({ className = '', size = 44, withWordmark = false }: Props) {
  const uid = useId().replace(/:/g, '')
  const gid = `pv-grad-${uid}`
  const sg = `pv-spark-${uid}`

  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 drop-shadow-[0_8px_24px_rgba(124,58,237,0.25)]', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="6" y1="4" x2="44" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED" />
          <stop offset="0.55" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#22D3C5" />
        </linearGradient>
        <linearGradient id={sg} x1="28" y1="6" x2="40" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#22D3C5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="15" fill={`url(#${gid})`} />
      <rect x="2" y="2" width="44" height="44" rx="15" fill="white" fillOpacity="0.08" />
      <path
        d="M17 21.5c0-1.9 1.5-3.4 3.4-3.4h7.2c1.9 0 3.4 1.5 3.4 3.4v1.1c0 2.5-2 4.5-4.5 4.5h-5c-2.5 0-4.5-2-4.5-4.5v-1.1Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path d="M18.5 29h11v2c0 0.9-0.7 1.6-1.6 1.6H20.1c-0.9 0-1.6-0.7-1.6-1.6V29Z" fill="white" fillOpacity="0.95" />
      <circle cx="20.2" cy="20.5" r="1.1" fill="#0F172A" fillOpacity="0.28" />
      <circle cx="27.8" cy="20.5" r="1.1" fill="#0F172A" fillOpacity="0.28" />
      <path
        d="M31 10.5c1 0 1.8 0.8 1.8 1.8v1.8h1.8c1 0 1.8 0.8 1.8 1.8s-0.8 1.8-1.8 1.8h-1.8v1.8c0 1-0.8 1.8-1.8 1.8s-1.8-0.8-1.8-1.8v-1.8h-1.8c-1 0-1.8-0.8-1.8-1.8s0.8-1.8 1.8-1.8h1.8v-1.8c0-1 0.8-1.8 1.8-1.8Z"
        fill={`url(#${sg})`}
      />
      <path
        d="M32.2 11.8l0.6 1.2 1.3 0.2-0.95 0.92 0.22 1.28-1.17-0.62-1.17 0.62 0.22-1.28-0.95-0.92 1.3-0.2 0.6-1.2Z"
        fill="white"
        fillOpacity="0.95"
      />
    </svg>
  )

  if (!withWordmark) return icon

  return (
    <div className="flex items-center gap-2.5">
      {icon}
      <span className="text-xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
        Pet<span className="bg-gradient-to-r from-[#7C3AED] via-[#3B82F6] to-[#22D3C5] bg-clip-text text-transparent">Via</span>
      </span>
    </div>
  )
}
