import { motion } from 'framer-motion'
import { LogoPetVia } from '../petvia/LogoPetVia'

export function IaOrbAvatar({ size = 72 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        className="pointer-events-none absolute inset-[-18%] rounded-full bg-gradient-to-tr from-brand-purple/35 via-brand-blue/25 to-brand-teal/25 blur-2xl"
        animate={{ opacity: [0.55, 0.85, 0.55], scale: [0.98, 1.03, 0.98] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute inset-[-8%] rounded-full border border-dashed border-brand-purple/25 dark:border-white/15"
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-white/70 to-white/20 shadow-[0_12px_40px_rgba(124,58,237,0.22)] ring-1 ring-white/70 backdrop-blur-md dark:from-slate-950/70 dark:to-slate-950/20 dark:ring-white/10"
        animate={{ boxShadow: ['0 12px 40px rgba(124,58,237,0.18)', '0 16px 55px rgba(59,130,246,0.22)', '0 12px 40px rgba(124,58,237,0.18)'] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <LogoPetVia size={Math.round(size * 0.62)} />
      </div>
    </div>
  )
}
