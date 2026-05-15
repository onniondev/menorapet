import type { ClinicRow, ClientRow, MessageRow, IntentCategory } from '../types/whatsapp.ts'

const CORE_SYSTEM = `Você é a PetVia AI, assistente virtual de clínicas veterinárias. Atenda clientes via WhatsApp de forma simpática, objetiva e segura. Você pode ajudar com agendamentos, dúvidas gerais, lembretes, vacinas, retornos e organização do atendimento. Você não pode diagnosticar doenças, prescrever medicamentos ou substituir um veterinário. Em sinais graves, recomende atendimento veterinário imediato e encaminhe para um humano.`

function clinicContextBlock(clinic: ClinicRow, contact: ClientRow, pet?: { name: string; species?: string | null; age?: string | null } | null) {
  const lines = [
    `Clínica: ${clinic.name}`,
    clinic.city ? `Cidade: ${clinic.city}` : null,
    clinic.phone || clinic.whatsapp_number ? `Telefone: ${clinic.phone ?? clinic.whatsapp_number}` : null,
    clinic.opening_hours ? `Horário: ${clinic.opening_hours}` : null,
    `Tutor: ${contact.name}`,
    pet?.name ? `Pet: ${pet.name}` : null,
    pet?.species ? `Espécie: ${pet.species}` : null,
    pet?.age ? `Idade: ${pet.age}` : null,
  ].filter(Boolean)
  return lines.join('\n')
}

export type GeneratePetViaReplyInput = {
  clinic: ClinicRow
  contact: ClientRow
  pet?: { name: string; species?: string | null; age?: string | null } | null
  history: MessageRow[]
  userMessage: string
  intent: IntentCategory
}

export async function generatePetViaReply(input: GeneratePetViaReplyInput): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY
  if (!openaiKey) throw new Error('OPENAI_API_KEY não configurada')

  const system = CORE_SYSTEM + '\n\n' + clinicContextBlock(input.clinic, input.contact, input.pet)

  const historyLines = input.history
    .slice(-12)
    .map((m) => `${m.direction === 'inbound' ? 'Cliente' : 'Atendimento'}: ${m.content}`)
    .join('\n')

  const userBlock = [
    `Intenção detectada: ${input.intent}`,
    historyLines ? `Histórico recente:\n${historyLines}` : '',
    `Mensagem atual do cliente: ${input.userMessage}`,
    'Responda em português brasileiro, curto (máx. 4 parágrafos curtos), com emojis moderados. Tente converter em consulta, retorno ou encaminhamento humano quando fizer sentido.',
  ]
    .filter(Boolean)
    .join('\n\n')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      temperature: 0.6,
      max_tokens: 400,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userBlock },
      ],
    }),
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((json as { error?: { message?: string } })?.error?.message ?? 'Erro OpenAI')
  }
  const text = (json as { choices?: { message?: { content?: string } }[] }).choices?.[0]?.message?.content?.trim()
  if (!text) throw new Error('Resposta vazia da OpenAI')
  return text
}
