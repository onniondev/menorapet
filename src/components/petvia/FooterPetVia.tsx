import { Link } from 'react-router-dom'
import { LogoPetVia } from './LogoPetVia'

export function FooterPetVia() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/60 py-12 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 px-4 sm:flex-row sm:px-6">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <LogoPetVia size={36} withWordmark />
          <p className="max-w-xs text-center text-xs leading-relaxed text-[#64748B] sm:text-left dark:text-slate-400">
            Sua clínica veterinária no automático.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-[#64748B] dark:text-slate-400">
          <Link to="/login" className="transition hover:text-[#7C3AED] dark:hover:text-[#22D3C5]">
            Login
          </Link>
          <Link to="/register" className="transition hover:text-[#7C3AED] dark:hover:text-[#22D3C5]">
            Criar conta
          </Link>
          <a href="#recursos" className="transition hover:text-[#7C3AED] dark:hover:text-[#22D3C5]">
            Recursos
          </a>
          <a href="#precos" className="transition hover:text-[#7C3AED] dark:hover:text-[#22D3C5]">
            Preços
          </a>
        </div>
        <p className="text-center text-xs text-[#64748B] dark:text-slate-500">
          © {new Date().getFullYear()} PetVia. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
