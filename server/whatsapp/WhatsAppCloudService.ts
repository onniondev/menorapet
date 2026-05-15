const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? 'v20.0'

export type SendTextResult = { ok: true; messageId: string } | { ok: false; error: string; status?: number }

export class WhatsAppCloudService {
  readonly providerId = 'meta_cloud' as const
  private token: string
  private phoneNumberId: string

  constructor(opts?: { token?: string; phoneNumberId?: string }) {
    this.token = opts?.token ?? process.env.META_WHATSAPP_TOKEN ?? ''
    this.phoneNumberId = opts?.phoneNumberId ?? process.env.META_PHONE_NUMBER_ID ?? ''
    if (!this.token || !this.phoneNumberId) {
      throw new Error('META_WHATSAPP_TOKEN e META_PHONE_NUMBER_ID são obrigatórios')
    }
  }

  private baseUrl() {
    return `https://graph.facebook.com/${GRAPH_VERSION}/${this.phoneNumberId}`
  }

  private async request(body: Record<string, unknown>): Promise<SendTextResult & { raw?: unknown }> {
    const res = await fetch(`${this.baseUrl()}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      const err = (json as { error?: { message?: string } })?.error?.message ?? JSON.stringify(json)
      return { ok: false, error: err, status: res.status, raw: json }
    }
    const messageId = (json as { messages?: { id: string }[] })?.messages?.[0]?.id ?? ''
    return { ok: true, messageId, raw: json }
  }

  async sendTextMessage(to: string, text: string): Promise<SendTextResult> {
    const toDigits = to.replace(/\D/g, '')
    return this.request({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: toDigits,
      type: 'text',
      text: { preview_url: false, body: text },
    })
  }

  async markMessageAsRead(messageId: string): Promise<{ ok: boolean; error?: string }> {
    const res = await fetch(`${this.baseUrl()}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      return { ok: false, error: JSON.stringify(json) }
    }
    return { ok: true }
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string,
    components?: Record<string, unknown>[],
  ): Promise<SendTextResult> {
    const toDigits = to.replace(/\D/g, '')
    return this.request({
      messaging_product: 'whatsapp',
      to: toDigits,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components: components ?? [],
      },
    })
  }
}
