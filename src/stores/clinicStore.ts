import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ClinicState = {
  currentClinicId: string | null
  setCurrentClinicId: (id: string | null) => void
  reset: () => void
}

export const useClinicStore = create<ClinicState>()(
  persist(
    (set) => ({
      currentClinicId: null,
      setCurrentClinicId: (id) => set({ currentClinicId: id }),
      reset: () => set({ currentClinicId: null }),
    }),
    { name: 'petvia-current-clinic' },
  ),
)
