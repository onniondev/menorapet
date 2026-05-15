import type { IntentCategory, IntentLevel } from '../types/whatsapp'

const RULES: { intent: IntentCategory; patterns: RegExp[]; level: IntentLevel }[] = [
  { intent: 'emergency', level: 'urgent', patterns: [/sangue|convuls|não respira|dificuldade respirat|envenen|atropel|inconscien|morrendo|urgente|emergên/i] },
  { intent: 'human_request', level: 'simple', patterns: [/falar com (um )?(atendente|humano|pessoa|veterinário)|quero (um )?atendente/i] },
  { intent: 'greeting', level: 'simple', patterns: [/^(oi|olá|ola|bom dia|boa tarde|boa noite|hey|e aí)\b/i] },
  { intent: 'opening_hours', level: 'simple', patterns: [/horário|horario|funciona|abre|fecha|atende/i] },
  { intent: 'location', level: 'simple', patterns: [/endereço|endereco|onde fica|localização|como chegar|mapa/i] },
  { intent: 'price_question', level: 'simple', patterns: [/preço|preco|valor|quanto custa|tabela/i] },
  { intent: 'payment', level: 'simple', patterns: [/pagamento|pix|cartão|cartao|boleto|parcel/i] },
  { intent: 'appointment_reschedule', level: 'simple', patterns: [/reagend|remarc|mudar (a )?consulta|trocar horário/i] },
  { intent: 'appointment_request', level: 'medium', patterns: [/agendar|marcar consulta|consulta|encaixe|horário disponível/i] },
  { intent: 'vaccine_reminder', level: 'medium', patterns: [/lembrete.*vacina|vacina.*venc/i] },
  { intent: 'vaccine_question', level: 'medium', patterns: [/vacina|antirrábica|v10|v8/i] },
  { intent: 'pet_history', level: 'medium', patterns: [/histórico|historico|prontuário|última consulta/i] },
]

const SIMPLE: IntentCategory[] = [
  'greeting',
  'opening_hours',
  'location',
  'price_question',
  'payment',
  'appointment_reschedule',
  'human_request',
]

const MEDIUM: IntentCategory[] = [
  'appointment_request',
  'vaccine_question',
  'vaccine_reminder',
  'pet_history',
  'unknown',
]

export type ClassifyResult = {
  intent: IntentCategory
  level: IntentLevel
}

export function classifyIntent(messageText: string, _context?: { lastIntent?: IntentCategory }): ClassifyResult {
  const t = messageText.trim()
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(t))) {
      return { intent: rule.intent, level: rule.level }
    }
  }
  if (/vômit|vomito|diarr|diarréia|não come|perdeu apetite|estranho|pós.?operat/i.test(t)) {
    return { intent: 'unknown', level: 'medium' }
  }
  if (/banho|tosa/i.test(t)) {
    return { intent: 'price_question', level: 'simple' }
  }
  return { intent: 'unknown', level: 'medium' }
}

export function intentLevel(intent: IntentCategory, classified: IntentLevel): IntentLevel {
  if (classified === 'urgent' || intent === 'emergency') return 'urgent'
  if (SIMPLE.includes(intent)) return 'simple'
  if (MEDIUM.includes(intent)) return 'medium'
  return classified
}
