import { useQueryClient } from '@tanstack/react-query'
import { Building2 } from 'lucide-react'
import { useMyClinics } from '../../hooks/useMyClinics'
import { useClinicStore } from '../../stores/clinicStore'

export function ClinicSwitcher() {
  const queryClient = useQueryClient()
  const { data: clinics, isLoading } = useMyClinics()
  const currentClinicId = useClinicStore((s) => s.currentClinicId)
  const setCurrentClinicId = useClinicStore((s) => s.setCurrentClinicId)

  if (isLoading || !clinics?.length) return null
  if (clinics.length < 2) return null

  return (
    <label className="flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white px-2 py-1.5 text-xs font-bold text-[#64748B] shadow-sm">
      <Building2 className="h-3.5 w-3.5 shrink-0 text-brand-purple" />
      <span className="hidden sm:inline">Clínica</span>
      <select
        className="max-w-[10rem] truncate bg-transparent text-xs font-extrabold text-[#0F172A] outline-none sm:max-w-[14rem]"
        value={currentClinicId ?? clinics[0]!.id}
        onChange={(e) => {
          setCurrentClinicId(e.target.value)
          void queryClient.invalidateQueries()
        }}
      >
        {clinics.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  )
}
