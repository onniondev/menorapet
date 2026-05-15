export type EvolutionInboundMessage = {
  instanceName: string
  remoteJid: string
  messageId: string
  text: string
  contactName: string
  fromMe: boolean
  raw: unknown
}

export type EvolutionWebhookEnvelope = {
  event?: string
  instance?: string
  instanceName?: string
  data?: unknown
}

function normalizeEvent(event?: string) {
  return (event ?? '').toUpperCase().replace(/\./g, '_')
}

function extractText(msg: Record<string, unknown>): string {
  const message = msg.message as Record<string, unknown> | undefined
  if (!message) return ''
  if (typeof message.conversation === 'string') return message.conversation
  const ext = message.extendedTextMessage as { text?: string } | undefined
  if (ext?.text) return ext.text
  const img = message.imageMessage as { caption?: string } | undefined
  if (img?.caption) return img.caption
  return ''
}

export function extractEvolutionInboundMessages(body: EvolutionWebhookEnvelope): EvolutionInboundMessage[] {
  const event = normalizeEvent(body.event)
  if (event !== 'MESSAGES_UPSERT') return []

  const instanceName = body.instance ?? body.instanceName ?? ''
  const data = body.data
  const list = Array.isArray(data) ? data : data ? [data] : []
  const out: EvolutionInboundMessage[] = []

  for (const item of list) {
    const row = item as Record<string, unknown>
    const key = row.key as { remoteJid?: string; fromMe?: boolean; id?: string } | undefined
    if (!key?.remoteJid || key.fromMe) continue
    const text = extractText(row)
    if (!text.trim()) continue
    out.push({
      instanceName,
      remoteJid: key.remoteJid,
      messageId: key.id ?? `${Date.now()}`,
      text: text.trim(),
      contactName: (row.pushName as string) ?? '',
      fromMe: Boolean(key.fromMe),
      raw: row,
    })
  }
  return out
}

export function isQrCodeEvent(body: EvolutionWebhookEnvelope) {
  const e = normalizeEvent(body.event)
  return e === 'QRCODE_UPDATED'
}

export function isConnectionEvent(body: EvolutionWebhookEnvelope) {
  return normalizeEvent(body.event) === 'CONNECTION_UPDATE'
}

export function extractQrFromWebhook(body: EvolutionWebhookEnvelope): string | null {
  const data = body.data as { qrcode?: { base64?: string }; base64?: string } | undefined
  const b64 = data?.qrcode?.base64 ?? data?.base64
  if (!b64) return null
  return b64.startsWith('data:') ? b64 : `data:image/png;base64,${b64}`
}

export function extractConnectionState(body: EvolutionWebhookEnvelope): string | undefined {
  const data = body.data as { state?: string; status?: string; instance?: { state?: string } } | undefined
  return data?.state ?? data?.status ?? data?.instance?.state
}
