import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle2, Copy, ExternalLink, Smartphone, Unplug } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useClinicContext } from '../../hooks/useClinicContext'
import * as whatsappApi from '../../services/evolution.service'

const STATUS_LABEL: Record<string, string> = {
  disconnected: 'Não ativado',
  connecting: 'Configurando…',
  connected: 'Ativo (Meta)',
  qrcode: 'Aguardando QR',
  error: 'Configuração incompleta',
}

export default function WhatsAppSettingsPage() {
  const { clinicId, clinic } = useClinicContext()
  const qc = useQueryClient()
  const [phoneNumberId, setPhoneNumberId] = useState('')

  const configQ = useQuery({
    queryKey: ['whatsapp-config', clinicId],
    enabled: Boolean(clinicId),
    queryFn: () => whatsappApi.apiWhatsAppConfig(clinicId!),
    staleTime: 60_000,
  })

  const statusQ = useQuery({
    queryKey: ['whatsapp-status', clinicId],
    enabled: Boolean(clinicId),
    queryFn: () => whatsappApi.apiWhatsAppStatus(clinicId!),
    refetchInterval: 30_000,
  })

  const connectM = useMutation({
    mutationFn: () =>
      whatsappApi.apiConnectWhatsApp(clinicId!, {
        displayName: clinic?.name,
        phoneNumberId: phoneNumberId.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success('WhatsApp Business (Meta) ativado para esta clínica.')
      void qc.invalidateQueries({ queryKey: ['whatsapp-status', clinicId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const logoutM = useMutation({
    mutationFn: () => whatsappApi.apiLogoutWhatsApp(clinicId!),
    onSuccess: () => {
      toast.success('WhatsApp desativado nesta clínica.')
      void qc.invalidateQueries({ queryKey: ['whatsapp-status', clinicId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const copy = (text: string, label: string) => {
    void navigator.clipboard.writeText(text)
    toast.success(`${label} copiado`)
  }

  if (!clinicId) return null

  const status = statusQ.data?.status ?? 'disconnected'
  const isMeta = statusQ.data?.provider !== 'evolution'
  const webhookUrl = statusQ.data?.webhookUrl ?? configQ.data?.webhookUrl ?? ''
  const isConnected = status === 'connected'
  const phone = statusQ.data?.phoneNumber
  const configuredPhoneId = statusQ.data?.phoneNumberId ?? ''

  return (
    <motion.div className="space-y-4">
      <motion.div className="flex flex-wrap items-center gap-3">
        <Link
          to="/app/conversas"
          className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-ink/85 hover:bg-slate-900/[0.04] dark:hover:bg-white/[0.06]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar às conversas
        </Link>
        <motion.div>
          <h2 className="text-lg font-extrabold tracking-tight">WhatsApp da clínica</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            API oficial Meta (WhatsApp Business Cloud) — sem servidor extra, funciona na Vercel.
          </p>
        </motion.div>
      </motion.div>

      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-3">
          <motion.div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            <Smartphone className="h-6 w-6" />
          </motion.div>
          <motion.div>
            <div className="text-sm font-extrabold">Status: {STATUS_LABEL[status] ?? status}</div>
            {phone ? <p className="text-xs text-slate-500">Número: {phone}</p> : null}
            {configuredPhoneId ? (
              <p className="text-xs text-slate-500">Phone Number ID: {configuredPhoneId}</p>
            ) : null}
          </motion.div>
        </div>

        {statusQ.isError ? (
          <p className="text-sm text-red-600">{(statusQ.error as Error).message}</p>
        ) : null}
        {statusQ.data?.metaError ? (
          <p className="text-sm text-amber-700 dark:text-amber-300">{statusQ.data.metaError}</p>
        ) : null}

        {!isMeta && statusQ.data?.evolutionError ? (
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Modo Evolution: {statusQ.data.evolutionError}. Defina WHATSAPP_PROVIDER=meta na Vercel (padrão).
          </p>
        ) : null}

        {isMeta ? (
          <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-sm font-semibold">Configuração única (admin / Vercel)</p>
            <ol className="list-decimal space-y-2 pl-5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              <li>
                Crie um app em{' '}
                <a
                  href="https://developers.facebook.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-brand-purple hover:underline"
                >
                  Meta for Developers
                </a>{' '}
                e ative o produto <strong>WhatsApp</strong>.
              </li>
              <li>
                Na Vercel, configure: <code>META_WHATSAPP_TOKEN</code>, <code>META_VERIFY_TOKEN</code>,{' '}
                <code>META_APP_SECRET</code>, <code>APP_URL</code>, <code>DATABASE_URL</code>.
              </li>
              <li>
                Webhook na Meta → Callback URL:
                {webhookUrl ? (
                  <span className="mt-1 flex flex-wrap items-center gap-2">
                    <code className="break-all rounded bg-white px-1 py-0.5 text-[11px] dark:bg-slate-900">
                      {webhookUrl}
                    </code>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-brand-purple"
                      onClick={() => copy(webhookUrl, 'URL')}
                    >
                      <Copy className="h-3 w-3" /> Copiar
                    </button>
                  </span>
                ) : (
                  ' (defina APP_URL na Vercel)'
                )}
              </li>
              <li>Assine o campo <strong>messages</strong> no webhook.</li>
            </ol>
            <a
              href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-purple hover:underline"
            >
              Documentação Meta Cloud API <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ) : null}

        {isMeta && !isConnected ? (
          <motion.div className="space-y-3">
            <label className="block text-sm font-semibold">
              Phone Number ID (Meta → WhatsApp → API Setup)
              <input
                className="mt-1 w-full max-w-md rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-900"
                placeholder={configuredPhoneId || 'Ex.: 123456789012345'}
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
              />
            </label>
            <p className="text-xs text-slate-500">
              Opcional se <code>META_PHONE_NUMBER_ID</code> já estiver na Vercel (uma clínica). Várias clíicas: informe
              um ID por clínica aqui.
            </p>
          </motion.div>
        ) : null}

        {isConnected ? (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Mensagens entram pelo webhook Meta e aparecem em Conversas. Respostas usam a API oficial.
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {!isConnected ? (
            <Button loading={connectM.isPending} onClick={() => connectM.mutate()}>
              Ativar WhatsApp (Meta)
            </Button>
          ) : (
            <Link to="/app/conversas">
              <Button variant="outline" type="button">
                Abrir inbox
              </Button>
            </Link>
          )}
          {isConnected ? (
            <Button variant="outline" loading={logoutM.isPending} onClick={() => logoutM.mutate()}>
              <Unplug className="mr-1 h-4 w-4" />
              Desativar
            </Button>
          ) : null}
        </div>

        <p className="text-xs text-slate-500">
          A Meta cobra conversas conforme a política de preços deles (há tier gratuito limitado para testes). Não há
          custo de servidor Evolution.
        </p>
      </Card>
    </motion.div>
  )
}
