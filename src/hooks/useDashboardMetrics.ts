import { useQuery } from '@tanstack/react-query'
import { loadDashboardMetrics } from '../services/dashboardService'
import type { DashboardPeriod } from '../types/domain'

export function useDashboardMetrics(
  clinicId: string | null,
  period: DashboardPeriod,
  clinicPlan?: string | null,
) {
  return useQuery({
    queryKey: ['dashboard-metrics', clinicId, period, clinicPlan ?? ''],
    enabled: Boolean(clinicId),
    staleTime: 45_000,
    queryFn: () => loadDashboardMetrics(clinicId!, period, clinicPlan),
  })
}
