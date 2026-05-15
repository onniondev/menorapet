import { useQuery } from '@tanstack/react-query'
import * as evolutionApi from '../services/evolution.service'

export function useWhatsAppConnection(clinicId: string | null | undefined) {
  const statusQ = useQuery({
    queryKey: ['whatsapp-status', clinicId],
    enabled: Boolean(clinicId),
    queryFn: () => evolutionApi.apiWhatsAppStatus(clinicId!),
    retry: false,
    refetchInterval: (q) => {
      const s = q.state.data?.status
      return s === 'qrcode' || s === 'connecting' ? 5000 : 30_000
    },
  })

  const status = statusQ.data?.status ?? (statusQ.isError ? 'unknown' : 'disconnected')
  const isConnected = status === 'connected'
  const needsQr = status === 'qrcode' || status === 'connecting'
  const phone = statusQ.data?.phoneNumber ?? statusQ.data?.instance?.phone_number ?? null
  const qrCode = statusQ.data?.qrCode ?? statusQ.data?.instance?.qr_code ?? null

  return {
    statusQ,
    status,
    isConnected,
    needsQr,
    phone,
    qrCode,
  }
}
