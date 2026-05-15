import { appWebhookUrl, instanceNameForClinic, requestEvolution } from './evolutionClient.ts'

export function buildInstanceName(clinicId: string) {
  return instanceNameForClinic(clinicId)
}

export async function createInstance(clinicId: string, displayName?: string) {
  const instanceName = buildInstanceName(clinicId)
  return requestEvolution('POST', '/instance/create', {
    instanceName,
    integration: 'WHATSAPP-BAILEYS',
    qrcode: true,
    ...(displayName ? { instanceName } : {}),
  })
}

export async function connectInstance(instanceName: string) {
  return requestEvolution<{ base64?: string; pairingCode?: string; code?: string }>(
    'GET',
    `/instance/connect/${instanceName}`,
  )
}

export async function getConnectionState(instanceName: string) {
  return requestEvolution<{ instance?: { state?: string }; state?: string }>(
    'GET',
    `/instance/connectionState/${instanceName}`,
  )
}

export async function getQrCode(instanceName: string) {
  return connectInstance(instanceName)
}

export async function logoutInstance(instanceName: string) {
  return requestEvolution('DELETE', `/instance/logout/${instanceName}`)
}

export async function deleteInstance(instanceName: string) {
  return requestEvolution('DELETE', `/instance/delete/${instanceName}`)
}

export async function restartInstance(instanceName: string) {
  return requestEvolution('PUT', `/instance/restart/${instanceName}`)
}

export async function setWebhook(instanceName: string, webhookUrl?: string) {
  const url = webhookUrl ?? appWebhookUrl()
  if (!url) return { ok: false as const, error: 'APP_URL não configurada', status: 500 }

  return requestEvolution('POST', `/webhook/set/${instanceName}`, {
    webhook: {
      enabled: true,
      url,
      webhookByEvents: false,
      webhookBase64: false,
      events: [
        'QRCODE_UPDATED',
        'CONNECTION_UPDATE',
        'MESSAGES_UPSERT',
        'MESSAGES_UPDATE',
        'SEND_MESSAGE',
        'CONTACTS_UPDATE',
        'CHATS_UPDATE',
      ],
    },
  })
}

export async function sendTextMessage(instanceName: string, to: string, text: string) {
  const number = to.replace(/\D/g, '')
  return requestEvolution<{ key?: { id?: string } }>('POST', `/message/sendText/${instanceName}`, {
    number,
    text,
  })
}

export async function sendMediaMessage(instanceName: string, to: string, mediaUrl: string, caption?: string) {
  const number = to.replace(/\D/g, '')
  return requestEvolution('POST', `/message/sendMedia/${instanceName}`, {
    number,
    mediatype: 'image',
    media: mediaUrl,
    caption: caption ?? '',
  })
}

export function mapEvolutionState(state?: string): 'disconnected' | 'connecting' | 'connected' | 'qrcode' | 'error' {
  const s = (state ?? '').toLowerCase()
  if (s === 'open' || s === 'connected') return 'connected'
  if (s === 'connecting') return 'connecting'
  if (s === 'close' || s === 'closed' || s === 'disconnected') return 'disconnected'
  if (s.includes('qr')) return 'qrcode'
  return 'error'
}

export function extractQrFromConnect(data: { base64?: string; pairingCode?: string; code?: string } | undefined) {
  if (!data) return null
  if (data.base64) return data.base64.startsWith('data:') ? data.base64 : `data:image/png;base64,${data.base64}`
  return null
}
