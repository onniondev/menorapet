import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, QrCode, RefreshCw, Smartphone, Unplug } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useClinicContext } from '../../hooks/useClinicContext'
import * as evolutionApi from '../../services/evolution.service'

const STATUS_LABEL: Record<string, string> = {
  disconnected: 'Desconectado',
  connecting: 'Conectando…',
  connected: 'Conectado',
  qrcode: 'Aguardando leitura do QR',
  error: 'Erro',
}

export default function WhatsAppSettingsPage() {
  const { clinicId, clinic } = useClinicContext()
  const qc = useQueryClient()
  const [qr, setQr] = useState<string | null>(null)

  const statusQ = useQuery({
    queryKey: ['whatsapp-status', clinicId],
    enabled: Boolean(clinicId),
    queryFn: () => evolutionApi.apiWhatsAppStatus(clinicId!),
    refetchInterval: (q) => {
      const s = q.state.data?.status
      return s === 'qrcode' || s === 'connecting' ? 4000 : false
    },
  })

  useEffect(() => {
    const code = statusQ.data?.qrCode ?? statusQ.data?.instance?.qr_code
    if (code) setQr(code)
  }, [statusQ.data])

  const connectM = useMutation({
    mutationFn: () => evolutionApi.apiConnectWhatsApp(clinicId!, clinic?.name),
    onSuccess: (data) => {
      if (data.qrCode) setQr(data.qrCode)
      toast.success('Instância criada. Escaneie o QR Code no WhatsApp Business.')
      void qc.invalidateQueries({ queryKey: ['whatsapp-status', clinicId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const refreshQrM = useMutation({
    mutationFn: () => evolutionApi.apiRefreshQrCode(clinicId!),
    onSuccess: (data) => {
      if (data.qrCode) setQr(data.qrCode)
      void qc.invalidateQueries({ queryKey: ['whatsapp-status', clinicId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const logoutM = useMutation({
    mutationFn: () => evolutionApi.apiLogoutWhatsApp(clinicId!),
    onSuccess: () => {
      setQr(null)
      toast.success('WhatsApp desconectado.')
      void qc.invalidateQueries({ queryKey: ['whatsapp-status', clinicId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (!clinicId) return null

  const status = statusQ.data?.status ?? 'disconnected'
  const phone = statusQ.data?.phoneNumber ?? statusQ.data?.instance?.phone_number

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/app/conversas"
          className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-ink/85 hover:bg-slate-900/[0.04] dark:hover:bg-white/[0.06]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar às conversas
        </Link>
        <div>
          <h2 className="text-lg font-extrabold tracking-tight">WhatsApp da clínica</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Conexão via Evolution API (QR Code). Multiatendimento e IA PetVia.
          </p>
        </div>
      </div>

      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-extrabold">Status: {STATUS_LABEL[status] ?? status}</div>
            {phone ? <p className="text-xs text-slate-500">Número: {phone}</p> : null}
          </div>
        </div>

        {(status === 'qrcode' || status === 'connecting' || qr) && qr ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-300 p-6 dark:border-white/15">
            <QrCode className="h-5 w-5 text-slate-500" />
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              No WhatsApp Business: Dispositivos conectados → Conectar dispositivo → escaneie o QR.
            </p>
            <img src={qr} alt="QR Code WhatsApp" className="max-h-64 w-64 rounded-2xl bg-white p-2" />
            <Button variant="outline" size="sm" loading={refreshQrM.isPending} onClick={() => refreshQrM.mutate()}>
              <RefreshCw className="mr-1 h-4 w-4" />
              Atualizar QR
            </Button>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {status !== 'connected' ? (
            <Button loading={connectM.isPending} onClick={() => connectM.mutate()}>
              {status === 'disconnected' ? 'Conectar WhatsApp' : 'Reconectar'}
            </Button>
          ) : (
            <Link to="/app/conversas">
              <Button variant="outline" type="button">
                Abrir inbox
              </Button>
            </Link>
          )}
          {status === 'connected' || status === 'qrcode' ? (
            <Button variant="outline" loading={logoutM.isPending} onClick={() => logoutM.mutate()}>
              <Unplug className="mr-1 h-4 w-4" />
              Desconectar
            </Button>
          ) : null}
        </div>

        {statusQ.isError ? (
          <p className="text-sm text-red-600">{(statusQ.error as Error).message}</p>
        ) : null}
        {statusQ.data?.evolutionError && !statusQ.isError ? (
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Evolution API inacessível da Vercel ({statusQ.data.evolutionError}). Use URL pública da Evolution, não
            localhost — ou teste com <code className="text-xs">vercel dev</code> no PC.
          </p>
        ) : null}
      </Card>
    </div>
  )
}
