import { useId } from 'react'

type Props = {
  className?: string
  size?: number
}

export function PetviaLogo({ className = '', size = 40 }: Props) {
  const uid = useId().replace(/:/g, '')
  const gid = `petvia-grad-${uid}`
  const glow = `petvia-glow-${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="8" y1="6" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED" />
          <stop offset="1" stopColor="#22D3C5" />
        </linearGradient>
        <linearGradient id={glow} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#3B82F6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#22D3C5" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="42" height="42" rx="14" fill={`url(#${gid})`} />
      <rect x="3" y="3" width="42" height="42" rx="14" fill={`url(#${glow})`} opacity="0.35" />
      <path
        d="M16 22c0-2 1.6-3.6 3.6-3.6h8.8c2 0 3.6 1.6 3.6 3.6v1.2c0 2.8-2.2 5-5 5H21c-2.8 0-5-2.2-5-5V22Z"
        fill="white"
        fillOpacity="0.92"
      />
      <path d="M18 30h12v2.2c0 1-0.8 1.8-1.8 1.8H19.8c-1 0-1.8-0.8-1.8-1.8V30Z" fill="white" fillOpacity="0.92" />
      <circle cx="20.2" cy="21" r="1.2" fill="#0F172A" fillOpacity="0.35" />
      <circle cx="27.8" cy="21" r="1.2" fill="#0F172A" fillOpacity="0.35" />
      <path
        d="M30 12c1.2 0 2.2 1 2.2 2.2v2.2h2.2c1.2 0 2.2 1 2.2 2.2s-1 2.2-2.2 2.2H32.2v2.2c0 1.2-1 2.2-2.2 2.2s-2.2-1-2.2-2.2V20.8H25.6c-1.2 0-2.2-1-2.2-2.2s1-2.2 2.2-2.2h2.2V14.2c0-1.2 1-2.2 2.2-2.2Z"
        fill="#EEF2FF"
        fillOpacity="0.95"
      />
    </svg>
  )
}
