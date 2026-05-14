import { useEffect } from 'react'
import { useClinicStore } from '../stores/clinicStore'
import { useMyClinics } from './useMyClinics'

export function useCurrentClinic() {
  const { data: clinics, isLoading } = useMyClinics()
  const currentClinicId = useClinicStore((s) => s.currentClinicId)
  const setCurrentClinicId = useClinicStore((s) => s.setCurrentClinicId)

  useEffect(() => {
    if (!clinics?.length) return
    const exists = currentClinicId && clinics.some((c) => c.id === currentClinicId)
    if (!exists) setCurrentClinicId(clinics[0]!.id)
  }, [clinics, currentClinicId, setCurrentClinicId])

  const clinic = clinics?.find((c) => c.id === currentClinicId) ?? clinics?.[0] ?? null

  return { clinic, clinics: clinics ?? [], isLoading }
}
