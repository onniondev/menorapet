import type { InboundWhatsAppMessage } from './inboundProcessor'

export type MetaWebhookPayload = {
  object?: string
  entry?: {
    id?: string
    changes?: {
      field?: string
      value?: {
        metadata?: { phone_number_id?: string; display_phone_number?: string }
        contacts?: { profile?: { name?: string }; wa_id?: string }[]
        messages?: {
          from?: string
          id?: string
          timestamp?: string
          type?: string
          text?: { body?: string }
        }[]
        statuses?: unknown[]
      }
    }[]
  }[]
}

export function extractInboundMessages(payload: MetaWebhookPayload): InboundWhatsAppMessage[] {
  const out: InboundWhatsAppMessage[] = []
  if (payload.object !== 'whatsapp_business_account') return out

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== 'messages') continue
      const value = change.value
      if (!value?.metadata?.phone_number_id) continue
      const phoneNumberId = value.metadata.phone_number_id
      const contactName = value.contacts?.[0]?.profile?.name ?? 'Cliente WhatsApp'

      for (const msg of value.messages ?? []) {
        if (msg.type !== 'text' || !msg.text?.body || !msg.from || !msg.id) continue
        out.push({
          phoneNumberId,
          waId: msg.from,
          contactName,
          messageId: msg.id,
          timestamp: msg.timestamp ?? String(Date.now()),
          text: msg.text.body,
          raw: msg,
        })
      }
    }
  }
  return out
}
