export type FaqIntent =
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

export type FaqClinicInfo = {
  clinicName: string
  city?: string | null
  address?: string | null
  phone?: string | null
  openingHours?: string | null
}

export function getFaqReply(intent: FaqIntent, clinic: FaqClinicInfo): string | null {
  const name = clinic.clinicName
  const phone = clinic.phone ?? 'nosso WhatsApp'
  const hours = clinic.openingHours ?? 'consulte nossos horários com a equipe'
  const city = clinic.city ?? ''
  const address = clinic.address ?? ''

  switch (intent) {
    case 'greeting':
      return `Olá! 👋 Sou a assistente virtual da ${name}. Posso ajudar com agendamento, vacinas, horários e dúvidas gerais. Como posso te ajudar hoje?`
    case 'opening_hours':
      return `Nosso horário de atendimento na ${name}:\n${hours}\n\nQuer que eu veja um horário para consulta?`
    case 'location':
      return city || address
        ? `Estamos em ${[address, city].filter(Boolean).join(' — ')}.\n\nPosso ajudar a agendar uma visita?`
        : `Entre em contato pelo ${phone} que a equipe informa o endereço certinho. Quer agendar consulta?`
    case 'appointment_request':
      return `Claro! Para agendar na ${name}, me diga o nome do pet, o motivo da consulta e se prefere manhã ou tarde. A equipe confirma o horário em seguida. 📅`
    case 'appointment_reschedule':
      return `Sem problema! Me envie o nome do tutor/pet e o dia/horário que prefere remarcar. A equipe ajusta e confirma pra você.`
    case 'vaccine_question':
    case 'vaccine_reminder':
      return `Sobre vacinas na ${name}: a carteira e o calendário dependem da idade e espécie do pet. Me diga o nome e a idade do pet que orientamos o próximo passo — ou agendamos a aplicação. 💉`
    case 'price_question':
      return `Os valores variam conforme o serviço (consulta, vacina, banho, exames). Me diga o que você precisa que a equipe passa uma estimativa, ou agendamos uma avaliação.`
    case 'payment':
      return `Formas de pagamento e condições: nossa equipe informa na recepção ou por aqui. Me diga o serviço que você quer saber.`
    case 'human_request':
      return `Vou chamar um atendente da ${name} para continuar com você. Um momento, por favor. 🙏`
    case 'emergency':
      return `Isso pode ser uma situação urgente. Recomendamos atendimento veterinário imediato na ${name} ou no serviço de emergência mais próximo.\n\nSe puder, já estamos priorizando seu contato. Ligue também: ${phone}`
    default:
      return null
  }
}

/** Banho/tosa — resposta pronta quando detectado no classificador */
export function getGroomingFaq(clinic: FaqClinicInfo): string {
  return `Banho e tosa na ${clinic.clinicName}: valores e horários dependem do porte e do pelo. Me diga o nome e o porte do pet que a equipe passa as opções ou agenda. ✂️`
}
