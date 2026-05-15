export type ConversationStatus = 'open' | 'pending' | 'closed'
export type ConversationQueue = 'sales' | 'support' | 'veterinary' | 'financial' | 'general'
export type MessageDirection = 'inbound' | 'outbound'
export type MessageSenderType = 'client' | 'agent' | 'ai' | 'system'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export type IntentCategory =
  | 'greeting'
  | 'appointment_request'
  | 'appointment_reschedule'
  | 'vaccine_question'
  | 'vaccine_reminder'
  | 'price_question'
  | 'opening_hours'
  | 'location'
  | 'emergency'
  | 'payment'
  | 'human_request'
  | 'pet_history'
  | 'unknown'

export type IntentLevel = 'simple' | 'medium' | 'urgent'

export type ClinicRow = {
  id: string
  name: string
  phone: string | null
  whatsapp_number: string | null
  city: string | null
  address: string | null
  opening_hours: string | null
  whatsapp_phone_number_id: string | null
}

export type ClientRow = {
  id: string
  clinic_id: string
  name: string
  phone: string | null
  wa_id: string | null
  whatsapp_jid?: string | null
}

export type ConversationRow = {
  id: string
  clinic_id: string
  client_id: string
  status: ConversationStatus
  assigned_to_id: string | null
  queue: ConversationQueue
  ai_assistance_enabled: boolean
  last_message_at: string
  whatsapp_instance_id?: string | null
}

export type MessageRow = {
  id: string
  conversation_id: string | null
  direction: MessageDirection
  sender_type: MessageSenderType
  content: string
  external_message_id: string | null
  created_at: string
}
