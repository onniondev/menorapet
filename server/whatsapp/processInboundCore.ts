import { classifyIntent, intentLevel } from '../ai/classifyIntent.ts'
import { generatePetViaReply } from '../ai/generatePetViaReply.ts'
import { getFaqReply, getGroomingFaq } from '../ai/petvia-faq.ts'
import { query } from '../db/pool.ts'
import type { ClinicRow, ConversationQueue, ConversationRow } from '../types/whatsapp.ts'
import type { WhatsAppProvider } from './providers/WhatsAppProvider.ts'
import {
  assignConversationHuman,
  createConversation,
  createUrgentTicket,
  findMessageByExternalId,
  getConversationHistory,
  getOpenConversation,
  getPrimaryPet,
  insertInboundMessage,
  insertOutboundMessage,
  logWebhook,
  upsertClientFromEvolution,
} from './repositories.ts'

export type InboundCoreInput = {
  clinic: ClinicRow
  instanceId?: string | null
  remoteJid: string
  contactName: string
  messageId: string
  text: string
  raw: unknown
  provider: WhatsAppProvider | null
}

function queueForIntent(intent: string): ConversationQueue {
  if (intent === 'emergency') return 'veterinary'
  if (intent === 'payment') return 'financial'
  if (intent === 'human_request') return 'support'
  return 'general'
}

function recipientFromJid(jid: string) {
  return jid.replace(/@.*/, '').replace(/\D/g, '') || jid
}

export async function processInboundCore(input: InboundCoreInput): Promise<void> {
  const { clinic, messageId, text, raw, provider } = input
  const duplicate = await findMessageByExternalId(clinic.id, messageId)
  if (duplicate) return

  const phone = recipientFromJid(input.remoteJid)
  const client = await upsertClientFromEvolution(
    clinic.id,
    input.remoteJid,
    input.contactName,
    phone,
  )

  let conversation = await getOpenConversation(clinic.id, client.id)
  if (!conversation) {
    conversation = await createConversation(clinic.id, client.id, 'general', input.instanceId ?? undefined)
  } else if (input.instanceId && !conversation.whatsapp_instance_id) {
    await query(
      `update public.whatsapp_conversations set whatsapp_instance_id = $2, updated_at = now() where id = $1`,
      [conversation.id, input.instanceId],
    )
  }

  await insertInboundMessage({
    clinicId: clinic.id,
    clientId: client.id,
    conversationId: conversation.id,
    externalMessageId: messageId,
    content: text,
    rawPayload: raw,
  })

  const humanAssigned = Boolean(conversation.assigned_to_id)
  const aiAllowed = conversation.ai_assistance_enabled && !humanAssigned

  if (!aiAllowed) {
    await logWebhook(clinic.id, 'inbound_human_queue', { messageId })
    return
  }

  if (!provider) {
    await logWebhook(clinic.id, 'inbound_no_provider', { messageId })
    return
  }

  const { intent, level } = classifyIntent(text)
  const resolvedLevel = intentLevel(intent, level)

  let replyText: string | null = null
  let senderType: 'ai' | 'system' = 'ai'

  if (resolvedLevel === 'urgent' || intent === 'emergency') {
    await createUrgentTicket(clinic.id, conversation.id, `Emergência WhatsApp: ${text.slice(0, 120)}`)
    await assignConversationHuman(conversation.id, 'veterinary', true)
    replyText =
      getFaqReply('emergency', {
        clinicName: clinic.name,
        city: clinic.city,
        address: clinic.address,
        phone: clinic.phone ?? clinic.whatsapp_number,
        openingHours: clinic.opening_hours,
      }) ?? 'Recomendamos atendimento veterinário imediato. Um atendente será acionado.'
    senderType = 'system'
  } else if (intent === 'human_request') {
    await assignConversationHuman(conversation.id, 'support', true)
    replyText = getFaqReply('human_request', { clinicName: clinic.name })
    senderType = 'system'
  } else if (/banho|tosa/i.test(text)) {
    replyText = getGroomingFaq({ clinicName: clinic.name })
  } else if (resolvedLevel === 'simple') {
    replyText = getFaqReply(intent, {
      clinicName: clinic.name,
      city: clinic.city,
      address: clinic.address,
      phone: clinic.phone ?? clinic.whatsapp_number,
      openingHours: clinic.opening_hours,
    })
  }

  if (!replyText && resolvedLevel === 'medium') {
    const history = await getConversationHistory(conversation.id)
    const pet = await getPrimaryPet(client.id)
    try {
      replyText = await generatePetViaReply({
        clinic,
        contact: client,
        pet,
        history,
        userMessage: text,
        intent,
      })
    } catch (e) {
      await logWebhook(clinic.id, 'ai_error', { error: String(e) })
      replyText = `Recebi sua mensagem! Um momento — nossa equipe da ${clinic.name} vai te ajudar em seguida.`
      await assignConversationHuman(conversation.id, queueForIntent(intent), false)
    }
  }

  if (!replyText) {
    replyText = `Obrigada pela mensagem! Como posso ajudar você na ${clinic.name}? Posso falar sobre horários, agendamento ou vacinas.`
  }

  const to = client.whatsapp_jid ?? client.wa_id ?? phone
  const sent = await provider.sendTextMessage(to, replyText)
  if (!sent.ok) {
    await logWebhook(clinic.id, 'send_failed', { error: sent.error, to })
    return
  }

  await insertOutboundMessage({
    clinicId: clinic.id,
    clientId: client.id,
    conversationId: conversation.id,
    content: replyText,
    senderType,
    externalMessageId: sent.messageId,
  })
}
