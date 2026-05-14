import { Loader2, PawPrint, Search, Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { useClinicContext } from '../hooks/useClinicContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { globalSearchClientsAndPets } from '../services/searchService'

export default function BuscaGlobalPage() {
  const [params] = useSearchParams()
  const q = useMemo(() => (params.get('q') ?? '').trim(), [params])
  const { clinicId } = useClinicContext()

  const searchQ = useQuery({
    queryKey: ['global-search', clinicId, q],
    enabled: Boolean(clinicId && q.length >= 2 && isSupabaseConfigured),
    queryFn: () => globalSearchClientsAndPets(clinicId!, q),
  })

  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Busca global</h1>
        <Card padding="lg" className="border-[#E2E8F0] bg-white text-sm font-medium text-[#64748B] shadow-sm">
          Configure <code className="rounded bg-[#F8FAFC] px-1">VITE_SUPABASE_URL</code> e{' '}
          <code className="rounded bg-[#F8FAFC] px-1">VITE_SUPABASE_ANON_KEY</code> para buscar tutores e pets no banco.
        </Card>
      </div>
    )
  }

  if (!clinicId) {
    return null
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">Busca global</h1>
        <p className="mt-1 text-sm font-medium text-[#64748B]">
          {q ? (
            <>
              Resultados para <span className="font-extrabold text-ink">&quot;{q}&quot;</span>
            </>
          ) : (
            'Use a barra de busca no topo e pressione Enter.'
          )}
        </p>
      </div>

      {q.length > 0 && q.length < 2 ? (
        <Card padding="md" className="border-amber-200 bg-amber-50 text-sm font-semibold text-amber-950 shadow-sm">
          Digite pelo menos 2 caracteres para buscar.
        </Card>
      ) : null}

      {searchQ.isFetching ? (
        <div className="flex items-center gap-2 text-sm font-semibold text-[#64748B]">
          <Loader2 className="h-5 w-5 animate-spin text-brand-purple" />
          Buscando…
        </div>
      ) : null}

      {searchQ.isError ? (
        <Card padding="md" className="border-rose-200 bg-rose-50 text-sm font-semibold text-rose-900 shadow-sm">
          Erro ao buscar. Verifique permissões (RLS) e se as tabelas existem.
        </Card>
      ) : null}

      {q.length >= 2 && searchQ.isSuccess ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card padding="lg" className="border-[#E2E8F0] bg-white shadow-sm">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#0F172A]">
              <Users className="h-4 w-4 text-brand-purple" />
              Clientes ({searchQ.data.clients.length})
            </div>
            <ul className="mt-4 space-y-2">
              {searchQ.data.clients.length === 0 ? (
                <li className="text-sm font-semibold text-[#64748B]">Nenhum tutor encontrado.</li>
              ) : (
                searchQ.data.clients.map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/app/clientes"
                      className="block rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm font-bold text-[#0F172A] transition hover:border-brand-purple/30 hover:bg-white"
                    >
                      {c.name}
                      <div className="mt-1 text-xs font-semibold text-[#64748B]">{c.phone ?? c.email ?? '—'}</div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </Card>

          <Card padding="lg" className="border-[#E2E8F0] bg-white shadow-sm">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#0F172A]">
              <PawPrint className="h-4 w-4 text-brand-teal" />
              Pets ({searchQ.data.pets.length})
            </div>
            <ul className="mt-4 space-y-2">
              {searchQ.data.pets.length === 0 ? (
                <li className="text-sm font-semibold text-[#64748B]">Nenhum pet encontrado.</li>
              ) : (
                searchQ.data.pets.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/app/pets/${p.id}`}
                      className="block rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm font-bold text-[#0F172A] transition hover:border-brand-purple/30 hover:bg-white"
                    >
                      {p.name}
                      <div className="mt-1 text-xs font-semibold text-[#64748B]">
                        {[p.species, p.breed].filter(Boolean).join(' · ') || 'Pet'}
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </div>
      ) : null}

      {q.length >= 2 && searchQ.isSuccess && searchQ.data.clients.length === 0 && searchQ.data.pets.length === 0 ? (
        <Card padding="lg" className="flex items-center gap-3 border-dashed border-[#E2E8F0] bg-[#F8FAFC] text-sm font-semibold text-[#64748B] shadow-sm">
          <Search className="h-5 w-5 shrink-0 text-brand-purple" />
          Nenhum resultado. Tente outro termo ou cadastre tutores e pets.
        </Card>
      ) : null}
    </div>
  )
}
