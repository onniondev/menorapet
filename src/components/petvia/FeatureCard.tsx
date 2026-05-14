import { motion } from 'framer-motion'
import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

type Props = {
  icon: LucideIcon
  title: string
  description: string
  className?: string
  delay?: number
}

export function FeatureCard({ icon: Icon, title, description, className, delay = 0 }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative flex flex-col rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[#7C3AED]/25 hover:shadow-[0_22px_60px_rgba(124,58,237,0.12)] dark:border-white/10 dark:bg-slate-900/70 dark:hover:border-[#22D3C5]/30',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED]/12 to-[#22D3C5]/12 text-[#7C3AED] dark:text-[#22D3C5]">
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <h3 className="mt-4 text-lg font-extrabold tracking-tight text-[#0F172A] dark:text-white">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[#64748B] dark:text-slate-400">{description}</p>
      <div className="mt-4 flex justify-end text-[#7C3AED] opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100 dark:text-[#22D3C5]">
        <ArrowUpRight className="h-5 w-5" />
      </div>
    </motion.article>
  )
}
