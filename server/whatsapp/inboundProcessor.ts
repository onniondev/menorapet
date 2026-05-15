import { WhatsAppCloudService } from './WhatsAppCloudService'
import { processInboundCore } from './processInboundCore'
import { logWebhook, resolveClinicByPhoneNumberId } from './repositories'

export type InboundWhatsAppMessage = {
  phoneNumberId: string
  waId: string
  contactName: string
  messageId: string
  timestamp: string
  text: string
  raw: unknown
}

export async function processInboundWhatsAppMessage(msg: InboundWhatsAppMessage): Promise<void> {
  const clinic = await resolveClinicByPhoneNumberId(msg.phoneNumberId)
  if (!clinic) {
    await logWebhook(null, 'unknown_phone_number_id', msg.raw, `phone_number_id=${msg.phoneNumberId}`)
    return
  }

  const wa = new WhatsAppCloudService()
  void wa.markMessageAsRead(msg.messageId).catch(() => {})

  const jid = msg.waId.includes('@') ? msg.waId : `${msg.waId}@s.whatsapp.net`

  await processInboundCore({
    clinic,
    remoteJid: jid,
    contactName: msg.contactName,
    messageId: msg.messageId,
    text: msg.text,
    raw: msg.raw,
    provider: wa,
  })
}
