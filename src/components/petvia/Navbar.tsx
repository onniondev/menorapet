import { Link } from 'react-router-dom'
import { LogoPetVia } from './LogoPetVia'
import { ThemeToggle } from '../layout/ThemeToggle'
import { cn } from '../../lib/utils'

const link = 'text-sm font-semibold text-[#64748B] transition hover:text-[#7C3AED] dark:text-slate-400 dark:hover:text-[#22D3C5]'

type Props = {
  className?: string
}

export function Navbar({ className }: Props) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-white/70 bg-[#F8FAFC]/80 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70',
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoPetVia size={40} />
          <div className="leading-tight">
            <div className="text-base font-extrabold tracking-tight text-[#0F172A] dark:text-white">PetVia</div>
            <p className="text-[10px] font-semibold text-[#64748B] dark:text-slate-400">Sua clínica no automático.</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#produto" className={link}>
            Produto
          </a>
          <a href="#recursos" className={link}>
            Recursos
          </a>
          <a href="#precos" className={link}>
            Preços
          </a>
          <Link to="/login" className={link}>
            Login
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link
            to="/login"
            className="hidden rounded-2xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-bold text-[#0F172A] shadow-sm transition hover:border-[#7C3AED]/30 sm:inline-flex dark:border-white/10 dark:bg-slate-900 dark:text-white"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] px-3.5 py-2 text-xs font-bold text-white shadow-[0_10px_28px_rgba(124,58,237,0.35)] transition hover:brightness-105 sm:px-4 sm:text-sm"
          >
            Começar agora
          </Link>
        </div>
      </div>
    </header>
  )
}
