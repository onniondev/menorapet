/** Silhuetas abstratas (CSS/SVG) — sem imagens externas. */
export function PetSilhouetteDuo() {
  return (
    <div className="relative mx-auto flex max-w-sm items-end justify-center gap-6 pt-6">
      <svg width="120" height="100" viewBox="0 0 120 100" className="drop-shadow-lg" aria-hidden>
        <defs>
          <linearGradient id="dog" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FCD34D" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <ellipse cx="55" cy="88" rx="38" ry="10" fill="rgb(15 23 42 / 0.06)" />
        <path
          d="M30 70 Q20 40 45 28 Q55 22 68 30 Q88 38 88 62 Q88 78 72 82 Q55 86 38 78 Q28 74 30 70Z"
          fill="url(#dog)"
        />
        <ellipse cx="48" cy="48" rx="5" ry="7" fill="#92400E" opacity="0.35" />
        <ellipse cx="68" cy="50" rx="5" ry="7" fill="#92400E" opacity="0.35" />
        <path d="M52 58 Q60 64 68 58" stroke="#92400E" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
        <circle cx="40" cy="38" r="8" fill="url(#dog)" />
        <circle cx="78" cy="40" r="8" fill="url(#dog)" />
      </svg>
      <svg width="100" height="96" viewBox="0 0 100 96" className="-ml-4 drop-shadow-lg" aria-hidden>
        <defs>
          <linearGradient id="cat" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#E2E8F0" />
            <stop offset="1" stopColor="#94A3B8" />
          </linearGradient>
        </defs>
        <ellipse cx="52" cy="88" rx="32" ry="8" fill="rgb(15 23 42 / 0.06)" />
        <path
          d="M28 78 Q22 50 38 36 L32 18 L48 32 L62 30 L78 18 L72 38 Q88 52 82 76 Q78 86 52 88 Q30 86 28 78Z"
          fill="url(#cat)"
        />
        <path d="M44 52 L48 56 L52 52" stroke="#475569" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
        <ellipse cx="42" cy="46" rx="4" ry="5" fill="#0F172A" opacity="0.25" />
        <ellipse cx="60" cy="46" rx="4" ry="5" fill="#0F172A" opacity="0.25" />
      </svg>
    </div>
  )
}
