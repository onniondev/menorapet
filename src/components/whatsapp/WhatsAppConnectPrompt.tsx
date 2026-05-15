import { Link } from 'react-router-dom'
import { MessageCircle, QrCode, Smartphone } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { useWhatsAppConnection } from '../../hooks/useWhatsAppConnection'

const STATUS_LABEL: Record<string, string> = {
  disconnected: 'Não conectado',
  connecting: 'Conectando…',
  connected: 'Conectado',
  qrcode: 'Aguardando QR Code',
  error: 'Erro na conexão',
  unknown: 'Status indisponível',
}

type Props = {
  clinicId: string
  variant?: 'hero' | 'banner' | 'compact'
  className?: string
}

export function WhatsAppConnectPrompt({ clinicId, variant = 'banner', className = '' }: Props) {
  const { status, isConnected, needsQr, phone, qrCode, statusQ } = useWhatsAppConnection(clinicId)

  if (isConnected && variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 px-3 py-2 ${className}`}>
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
          <Smartphone className="h-4 w-4" />
          WhatsApp conectado{phone ? ` · ${phone}` : ''}
        </div>
        <Link to="/app/whatsapp" className="text-xs font-bold text-brand-purple hover:underline">
          Gerenciar
        </Link>
      </div>
    )
  }

  if (isConnected && variant !== 'hero') return null

  const connectPath = '/app/whatsapp'

  if (variant === 'hero') {
    return (
      <Card
        padding="lg"
        className={`relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-white to-brand-purple/5 dark:from-emerald-500/10 dark:via-slate-950/80 dark:to-brand-purple/10 ${className}`}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
              <MessageCircle className="h-7 w-7" />
            </div>
            <div>
              <Badge tone="success" leftIcon={<Smartphone className="h-3 w-3" />}>
                Atendimento WhatsApp
              </Badge>
              <h3 className="mt-2 text-lg font-extrabold tracking-tight">
                {isConnected ? 'WhatsApp vinculado à clínica' : 'Vincule o WhatsApp da clínica'}
              </h3>
              <p className="mt-1 max-w-lg text-sm text-slate-600 dark:text-slate-400">
                {isConnected
                  ? 'Sua equipe pode atender clientes no inbox com IA PetVia, filas e transferência entre setores.'
                  : 'Conecte o WhatsApp da clínica por QR Code — o número que a equipe já usa no dia a dia.'}
              </p>
              {!isConnected && needsQr && qrCode ? (
                <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                  <img src={qrCode} alt="QR Code" className="h-28 w-28 rounded-xl border bg-white p-1" />
                  <p className="text-xs text-slate-500">Escaneie no WhatsApp Business → Dispositivos conectados</p>
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            {!isConnected ? (
              <Link to={connectPath}>
                <Button type="button" leftIcon={<QrCode className="h-4 w-4" />}>
                  Conectar por QR Code
                </Button>
              </Link>
            ) : (
              <Link to="/app/conversas">
                <Button type="button" variant="outline">
                  Abrir conversas
                </Button>
              </Link>
            )}
            <Link to={connectPath} className="text-center text-xs font-semibold text-brand-purple hover:underline">
              {isConnected ? 'Configurações do WhatsApp' : 'Ver passo a passo e QR Code'}
            </Link>
          </div>
        </div>
        {statusQ.isError ? (
          <p className="relative mt-3 text-xs text-amber-700 dark:text-amber-300">
            Não foi possível consultar o status ({(statusQ.error as Error).message}). Ainda assim você pode tentar conectar — a API do servidor precisa estar no ar.
          </p>
        ) : null}
      </Card>
    )
  }

  return (
    <Card
      padding="md"
      className={`border-emerald-500/20 bg-gradient-to-r from-emerald-500/8 to-brand-purple/5 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold">
              {isConnected ? 'WhatsApp conectado' : 'Vincular WhatsApp para atendimento'}
            </div>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
              {isConnected
                ? phone
                  ? `Número ${phone} · inbox e IA ativos`
                  : 'Inbox e IA PetVia disponíveis'
                : `Status: ${STATUS_LABEL[status] ?? status} · escaneie o QR com o celular da clínica`}
            </p>
          </div>
        </div>
        <Link to={connectPath}>
          <Button type="button" size="sm" variant={isConnected ? 'outline' : 'primary'}>
            {isConnected ? 'Gerenciar' : 'Conectar agora'}
          </Button>
        </Link>
      </div>
    </Card>
  )
}
