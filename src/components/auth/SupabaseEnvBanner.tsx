import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { isSupabaseConfigured } from '../../lib/supabase'

const box =
  'mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100'

const code = 'rounded bg-black/5 px-1 font-mono text-[11px] dark:bg-white/10'

export function SupabaseEnvBanner() {
  const [open, setOpen] = useState(false)

  if (isSupabaseConfigured) return null

  return (
    <div className={box}>
      <p className="font-semibold">Supabase não configurado neste ambiente</p>

      {import.meta.env.DEV ? (
        <p className="mt-2 text-xs leading-relaxed opacity-95">
          Na <strong>raiz do repositório</strong>, crie ou edite <span className={code}>.env.local</span> com{' '}
          <span className={code}>VITE_SUPABASE_URL</span> e <span className={code}>VITE_SUPABASE_ANON_KEY</span> (valores em
          Supabase → <strong>Project Settings → API</strong>). Depois <strong>pare e rode de novo</strong>{' '}
          <span className={code}>npm run dev</span>.
        </p>
      ) : (
        <div className="mt-2 text-xs leading-relaxed opacity-95">
          <p>
            Em <strong>produção</strong>, o Vite embute essas variáveis <strong>no momento do build</strong>. O ficheiro{' '}
            <span className={code}>.env.local</span> da tua máquina <strong>não</strong> é enviado para a Vercel.
          </p>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-3 flex w-full items-center justify-between gap-2 rounded-xl border border-amber-600/25 bg-amber-500/10 px-3 py-2 text-left text-xs font-bold text-amber-950 transition hover:bg-amber-500/20 dark:border-amber-400/20 dark:text-amber-50 dark:hover:bg-amber-500/15"
          >
            Como configurar na Vercel
            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open ? (
            <ol className="mt-3 list-decimal space-y-2.5 pl-4 text-[11px] font-medium leading-relaxed">
              <li>
                Abre o projeto em{' '}
                <a
                  href="https://vercel.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-amber-900 underline underline-offset-2 dark:text-amber-50"
                >
                  vercel.com/dashboard
                </a>
                .
              </li>
              <li>
                <strong>Settings</strong> → <strong>Environment Variables</strong>.
              </li>
              <li>
                Adiciona <span className={code}>VITE_SUPABASE_URL</span> = URL do projeto (Supabase → Settings → API →
                Project URL).
              </li>
              <li>
                Adiciona <span className={code}>VITE_SUPABASE_ANON_KEY</span> = chave pública <strong>anon</strong> ou{' '}
                <strong>publishable</strong> (mesmo ecrã API).
              </li>
              <li>
                Marca os ambientes <strong>Production</strong> (e <strong>Preview</strong> se usares deploy de PR).
              </li>
              <li>
                <strong>Deployments</strong> → nos três pontos do último deploy → <strong>Redeploy</strong> (ou faz um
                commit novo). Sem novo build, o bundle continua sem as variáveis.
              </li>
            </ol>
          ) : null}

          <p className="mt-3">
            <a
              href="https://vercel.com/docs/projects/environment-variables"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-amber-900 underline underline-offset-2 dark:text-amber-50"
            >
              Documentação: variáveis de ambiente na Vercel →
            </a>
          </p>
        </div>
      )}
    </div>
  )
}
