import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, QrCode, RefreshCw, Smartphone, Unplug } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useClinicContext } from '../../hooks/useClinicContext'
import * as whatsappApi from '../../services/evolution.service'

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
    queryFn: () => whatsappApi.apiWhatsAppStatus(clinicId!),
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
    mutationFn: () => whatsappApi.apiConnectWhatsApp(clinicId!, { displayName: clinic?.name }),
    onSuccess: (data) => {
      if (data.qrCode) setQr(data.qrCode)
      toast.success('Escaneie o QR Code no WhatsApp do celular da clínica.')
      void qc.invalidateQueries({ queryKey: ['whatsapp-status', clinicId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const refreshQrM = useMutation({
    mutationFn: () => whatsappApi.apiRefreshQrCode(clinicId!),
    onSuccess: (data) => {
      if (data.qrCode) setQr(data.qrCode)
      void qc.invalidateQueries({ queryKey: ['whatsapp-status', clinicId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const logoutM = useMutation({
    mutationFn: () => whatsappApi.apiLogoutWhatsApp(clinicId!),
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
  const evolutionDown = statusQ.data?.evolutionReachable === false

  return (
    <motion.div className="space-y-4">
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
            Conexão por QR Code (Evolution API) — use o número WhatsApp da própria clínica.
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
              No celular da clínica: WhatsApp → Menu → Aparelhos conectados → Conectar aparelho → escaneie o QR.
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
              {status === 'disconnected' ? 'Gerar QR Code' : 'Reconectar'}
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

        {evolutionDown && !statusQ.isError ? (
          <div className="rounded-2xl border border-amber-300/60 bg-amber-50/80 p-4 text-sm text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100">
            <p className="font-semibold">Servidor Evolution não alcançável</p>
            <p className="mt-1 text-xs leading-relaxed opacity-90">
              {statusQ.data?.evolutionError ?? 'fetch failed'}. O PetVia na Vercel precisa de uma URL pública da
              Evolution (não use localhost em produção).
            </p>
            <p className="mt-2 text-xs leading-relaxed">
              <strong>Uma VPS barata</strong> (Oracle Always Free ou Hetzner ~€4/mês) roda o Docker do projeto para{' '}
              <strong>todas as clínicas</strong>, cada uma com seu QR e seu número. Veja{' '}
              <code className="rounded bg-black/5 px-1 dark:bg-white/10">docs/evolution-vps.md</code> no repositório.
            </p>
            <p className="mt-2 text-xs opacity-80">
              Na Vercel: <code>EVOLUTION_API_URL</code>, <code>EVOLUTION_API_KEY</code>,{' '}
              <code>EVOLUTION_WEBHOOK_SECRET</code>, <code>APP_URL</code>.
            </p>
          </div>
        ) : null}

        <details className="text-xs text-slate-500">
          <summary className="cursor-pointer font-semibold text-slate-600 dark:text-slate-400">
            Alternativa: API oficial Meta (sem QR, exige número Business na Meta)
          </summary>
          <p className="mt-2 leading-relaxed">
            Defina <code>WHATSAPP_PROVIDER=meta</code> na Vercel e siga <code>docs/whatsapp-meta-setup.md</code>.
          </p>
        </details>
      </Card>
    </motion.div>
  )
}
