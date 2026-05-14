export const dashboardMetrics = [
  { id: 'consultas', label: 'Consultas hoje', value: '18', delta: '+12%' },
  { id: 'mensagens', label: 'Mensagens pendentes', value: '7', delta: '3 urgentes' },
  { id: 'retornos', label: 'Retornos agendados', value: '24', delta: 'próx. 7 dias' },
  { id: 'pagamentos', label: 'Pagamentos recebidos', value: 'R$ 4.280', delta: '+8%' },
]

export const upcomingAppointments = [
  { id: '1', time: '09:00', pet: 'Thor', owner: 'Marina L.', vet: 'Dr. Pedro', service: 'Retorno pós-cirúrgico' },
  { id: '2', time: '10:30', pet: 'Luna', owner: 'João P.', vet: 'Dra. Ana', service: 'Vacina V10' },
  { id: '3', time: '11:15', pet: 'Simba', owner: 'Carla M.', vet: 'Dr. Pedro', service: 'Consulta clínica' },
  { id: '4', time: '14:00', pet: 'Mia', owner: 'Fernanda R.', vet: 'Dra. Ana', service: 'Banho e tosa' },
]

export const recentMessages = [
  { id: '1', from: 'Marina L.', preview: 'Oi! O Thor ainda está comendo pouco depois da cirurgia…', unread: true, time: '08:42' },
  { id: '2', from: 'João P.', preview: 'Podemos remarcar a vacina da Luna para sexta?', unread: true, time: 'Ontem' },
  { id: '3', from: 'Carla M.', preview: 'Obrigada pelo lembrete automático, chegamos certinho!', unread: false, time: 'Ontem' },
  { id: '4', from: 'Ricardo S.', preview: 'Qual o valor da consulta de emergência à noite?', unread: false, time: 'Seg' },
]

export const attendanceSeries = [42, 55, 38, 62, 48, 71, 58]

export const conversations = [
  {
    id: 'c1',
    name: 'Marina Lopes',
    pet: 'Thor · Golden',
    last: 'O Thor ainda está comendo pouco…',
    time: '08:42',
    unread: 2,
    channel: 'whatsapp' as const,
  },
  {
    id: 'c2',
    name: 'João Pereira',
    pet: 'Luna · SRD',
    last: 'Podemos remarcar a vacina?',
    time: 'Ontem',
    unread: 1,
    channel: 'whatsapp' as const,
  },
  {
    id: 'c3',
    name: 'Carla Mendes',
    pet: 'Simba · Persa',
    last: 'Chegamos certinho, obrigada!',
    time: 'Ontem',
    unread: 0,
    channel: 'whatsapp' as const,
  },
  {
    id: 'c4',
    name: 'Fernanda Rocha',
    pet: 'Mia · Siamês',
    last: 'Ela está espirrando muito.',
    time: 'Seg',
    unread: 0,
    channel: 'whatsapp' as const,
  },
]

export const chatMessages = [
  { id: 'm1', role: 'them' as const, text: 'Oi! O Thor ainda está comendo pouco depois da cirurgia. É normal?', time: '08:40' },
  { id: 'm2', role: 'ia' as const, text: 'Olá, Marina! A recuperação pode variar. Recomendo observar por 24–48h. Se persistir, podemos avaliar.', time: '08:41' },
  { id: 'm3', role: 'them' as const, text: 'Ele bebe água normalmente.', time: '08:42' },
]

export const weekSlots = [
  { day: 'Seg', date: '12', slots: [{ t: '09:00', pet: 'Thor', owner: 'Marina', status: 'confirmado' }] },
  {
    day: 'Ter',
    date: '13',
    slots: [
      { t: '10:30', pet: 'Luna', owner: 'João', status: 'confirmado' },
      { t: '15:00', pet: 'Bob', owner: 'Paula', status: 'pendente' },
    ],
  },
  { day: 'Qua', date: '14', slots: [{ t: '11:00', pet: 'Simba', owner: 'Carla', status: 'confirmado' }] },
  { day: 'Qui', date: '15', slots: [] },
  { day: 'Sex', date: '16', slots: [{ t: '14:30', pet: 'Mia', owner: 'Fernanda', status: 'confirmado' }] },
]

export const patients = [
  {
    id: 'p1',
    name: 'Thor',
    species: 'Cão · Golden Retriever',
    owner: 'Marina Lopes',
    lastVisit: '08/05/2026',
    status: 'Em acompanhamento',
  },
  {
    id: 'p2',
    name: 'Luna',
    species: 'Cão · SRD',
    owner: 'João Pereira',
    lastVisit: '22/04/2026',
    status: 'Vacina em dia',
  },
  {
    id: 'p3',
    name: 'Simba',
    species: 'Gato · Persa',
    owner: 'Carla Mendes',
    lastVisit: '30/04/2026',
    status: 'Check-up anual',
  },
  {
    id: 'p4',
    name: 'Mia',
    species: 'Gato · Siamês',
    owner: 'Fernanda Rocha',
    lastVisit: '01/05/2026',
    status: 'Alergia leve',
  },
]

export const patientHistory = [
  { id: 'h1', date: '08/05/2026', title: 'Retorno pós-operatório', note: 'Evolução favorável, ajuste de analgesia.' },
  { id: 'h2', date: '20/04/2026', title: 'Cirurgia — castração', note: 'Procedimento sem intercorrências.' },
  { id: 'h3', date: '10/01/2026', title: 'Consulta clínica', note: 'Exames laboratoriais dentro da normalidade.' },
]

export const automationFlows = [
  { id: 'a1', title: 'Lembrete de consulta', desc: '24h e 2h antes via WhatsApp', active: true, icon: 'bell' as const },
  { id: 'a2', title: 'Vacina próxima', desc: 'Alerta com data sugerida de retorno', active: true, icon: 'syringe' as const },
  { id: 'a3', title: 'Retorno atrasado', desc: 'Reengajamento com tom acolhedor', active: true, icon: 'calendar' as const },
  { id: 'a4', title: 'Cobrança pendente', desc: 'Link de pagamento + comprovante', active: false, icon: 'credit' as const },
  { id: 'a5', title: 'Cliente inativo', desc: 'Campanha suave a cada 90 dias', active: true, icon: 'users' as const },
]

export const financeRows = [
  { id: 'f1', label: 'Receitas (mês)', value: 'R$ 28.400', hint: '+6% vs mês anterior' },
  { id: 'f2', label: 'Pendências', value: 'R$ 3.120', hint: '12 faturas abertas' },
  { id: 'f3', label: 'Cobranças enviadas', value: '38', hint: 'últimos 30 dias' },
  { id: 'f4', label: 'Pagamentos confirmados', value: '31', hint: 'via Pix e cartão' },
]

export const dashboardKpis = [
  { id: 'k1', label: 'Consultas hoje', value: '18', hint: '4 encaixes IA', accent: 'purple' as const },
  { id: 'k2', label: 'IA ativa', value: '24/7', hint: '92% automático', accent: 'blue' as const },
  { id: 'k3', label: 'Clientes aguardando', value: '7', hint: 'SLA < 8 min', accent: 'teal' as const },
  { id: 'k4', label: 'Vacinas próximas', value: '6', hint: '7 dias', accent: 'teal' as const },
  { id: 'k5', label: 'Pendências financeiras', value: 'R$ 3,1k', hint: '12 abertas', accent: 'purple' as const },
  { id: 'k6', label: 'Taxa de retorno', value: '68%', hint: '+6 pts vs mês', accent: 'blue' as const },
]

export const clinicLiveTimeline = [
  { id: 'lt1', time: '08:41', title: 'IA respondeu Marina', detail: 'Triagem pós-cirúrgica · tom acolhedor', tag: 'WhatsApp' },
  { id: 'lt2', time: '08:15', title: 'Lembrete enviado', detail: 'Vacina V10 · Luna · amanhã 10:30', tag: 'Automação' },
  { id: 'lt3', time: '07:58', title: 'Agenda ajustada', detail: 'Encaixe sugerido às 16:20 (baixa ocupação)', tag: 'IA agenda' },
  { id: 'lt4', time: '07:40', title: 'Cobrança Pix disparada', detail: 'R$ 180,00 · João Pereira', tag: 'Financeiro' },
]

export const iaSmartAlerts = [
  {
    id: 'ia1',
    tone: 'warning' as const,
    title: '3 clientes não responderam',
    detail: 'Mensagens aguardando há mais de 6 horas.',
    action: 'Reenviar lembrete suave',
  },
  {
    id: 'ia2',
    tone: 'info' as const,
    title: 'Thor está sem retorno há 7 meses',
    detail: 'Perfil de risco moderado · oportunidade de reengajamento.',
    action: 'Sugerir consulta',
  },
  {
    id: 'ia3',
    tone: 'success' as const,
    title: '2 vacinas vencem hoje',
    detail: 'Luna e Bob · confirmação automática ativa.',
    action: 'Ver carteiras',
  },
]

export const iaInsightCards = [
  {
    id: 'ic1',
    title: 'Pico de mensagens',
    value: '11h–13h',
    detail: 'Reforçar IA nesse intervalo reduz fila em ~18%.',
  },
  {
    id: 'ic2',
    title: 'Clientes “quentes”',
    value: '14',
    detail: 'Alta intenção de agendar nas últimas 48h.',
  },
  {
    id: 'ic3',
    title: 'Risco de atraso',
    value: 'Baixo',
    detail: 'Previsão de atraso < 6% para a tarde de hoje.',
  },
]

export const todayDraggableAppointments = [
  {
    id: 'da1',
    time: '09:00',
    pet: 'Thor',
    owner: 'Marina',
    reason: 'Retorno pós-cirúrgico',
    status: 'confirmado' as const,
    urgent: false,
    vet: 'Dr. Pedro',
  },
  {
    id: 'da2',
    time: '10:30',
    pet: 'Luna',
    owner: 'João',
    reason: 'Vacina V10',
    status: 'confirmado' as const,
    urgent: true,
    vet: 'Dra. Ana',
  },
  {
    id: 'da3',
    time: '11:15',
    pet: 'Simba',
    owner: 'Carla',
    reason: 'Consulta clínica',
    status: 'pendente' as const,
    urgent: false,
    vet: 'Dr. Pedro',
  },
  {
    id: 'da4',
    time: '15:00',
    pet: 'Bob',
    owner: 'Paula',
    reason: 'Check-up',
    status: 'pendente' as const,
    urgent: false,
    vet: 'Dra. Ana',
  },
]

export const agendaAiHints = [
  { id: 'ah1', title: 'Encaixe sugerido', detail: '16:20 · 25 min · baixa fricção com a agenda atual.' },
  { id: 'ah2', title: 'Previsão de atraso', detail: 'Baixa chance de atraso na tarde (modelo mockado).' },
  { id: 'ah3', title: 'Confirmação automática', detail: '12 consultas com confirmação via WhatsApp hoje.' },
]

export const centralIaStats = [
  { id: 's1', label: 'Automações ativas', value: '18' },
  { id: 's2', label: 'Tarefas executadas (24h)', value: '142' },
  { id: 's3', label: 'Mensagens respondidas', value: '96' },
  { id: 's4', label: 'Clientes recuperados', value: '11' },
  { id: 's5', label: 'Cobranças automatizadas', value: '27' },
]

export const centralIaNodes = [
  { id: 'n1', label: 'Triagem', x: 18, y: 42 },
  { id: 'n2', label: 'Agenda', x: 48, y: 22 },
  { id: 'n3', label: 'Financeiro', x: 78, y: 40 },
  { id: 'n4', label: 'Retorno', x: 42, y: 72 },
  { id: 'n5', label: 'WhatsApp', x: 62, y: 68 },
]

export const conversationMeta: Record<
  string,
  {
    intent: string
    summary: string
    tags: string[]
    nextVaccine: string
    lastVisit: string
    billing: string
    suggested: string[]
  }
> = {
  c1: {
    intent: 'Pós-operatório · alimentação',
    summary: 'Tutor preocupada com apetite; sem vômitos; hidratação ok.',
    tags: ['Pós-cirúrgico', 'Golden', 'Prioridade moderada'],
    nextVaccine: 'V10 · sugerido em 45 dias',
    lastVisit: '08/05/2026 · retorno',
    billing: 'R$ 0,00 pendente',
    suggested: ['Agendar retorno em 48h', 'Enviar orientação alimentar', 'Pedir foto da ferida'],
  },
  c2: {
    intent: 'Remarcação de vacina',
    summary: 'Cliente quer mover vacina da Luna para sexta.',
    tags: ['Vacina', 'Agenda', 'Baixa urgência'],
    nextVaccine: 'V10 · hoje (pendente confirmação)',
    lastVisit: '22/04/2026',
    billing: 'R$ 180,00 · link enviado',
    suggested: ['Propor 3 horários', 'Confirmar jejum', 'Enviar endereço'],
  },
  c3: {
    intent: 'Feedback positivo',
    summary: 'Cliente agradece lembrete automático e pontualidade.',
    tags: ['Satisfação', 'Retenção'],
    nextVaccine: 'Antirrábica · 2027',
    lastVisit: '30/04/2026',
    billing: 'Sem pendências',
    suggested: ['Pedir avaliação Google', 'Oferecer plano de banho'],
  },
  c4: {
    intent: 'Sintomas respiratórios',
    summary: 'Espirros frequentes; sem secreção purulenta no relato.',
    tags: ['Respiratório', 'Observação'],
    nextVaccine: 'Em dia',
    lastVisit: '01/05/2026',
    billing: 'R$ 95,00 pago',
    suggested: ['Sugerir consulta curta', 'Checklist alérgenos', 'Lembrete de ar condicionado'],
  },
}

export const patientRichProfiles: Record<
  string,
  {
    photo: string
    age: string
    mood: string
    iaNote: string
    health: number[]
    vaccines: { name: string; due: string; status: 'ok' | 'due' }[]
    exams: string[]
    prescriptions: string[]
  }
> = {
  p1: {
    photo: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=900&q=80',
    age: '4 anos',
    mood: 'Recuperando com energia moderada',
    iaNote: 'A IA detectou que Thor perdeu 2 retornos consecutivos antes da cirurgia — ótimo momento para reforçar adesão.',
    health: [62, 58, 64, 70, 66, 74, 72, 78],
    vaccines: [
      { name: 'V10', due: '45 dias', status: 'ok' },
      { name: 'Antirrábica', due: '2027', status: 'ok' },
    ],
    exams: ['Hemograma (Jan/2026) — normal', 'Bioquímica leve alteração de proteínas'],
    prescriptions: ['Analgesia conforme protocolo', 'Anti-inflamatório dose única'],
  },
  p2: {
    photo: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80',
    age: '2 anos',
    mood: 'Animada e sociável',
    iaNote: 'Vacinas em dia; cliente responde rápido no WhatsApp.',
    health: [70, 72, 74, 76, 75, 78, 80, 82],
    vaccines: [
      { name: 'V10', due: 'Hoje', status: 'due' },
      { name: 'Giárdia', due: '120 dias', status: 'ok' },
    ],
    exams: ['Parasitológico — negativo'],
    prescriptions: ['Nenhuma ativa'],
  },
  p3: {
    photo: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=900&q=80',
    age: '6 anos',
    mood: 'Calmo e observador',
    iaNote: 'Padrão de consultas regulares; sugerir check-up anual com exames leves.',
    health: [78, 76, 77, 79, 80, 81, 82, 83],
    vaccines: [{ name: 'V4', due: 'Em dia', status: 'ok' }],
    exams: ['US abdominal (2025) — sem achados relevantes'],
    prescriptions: ['Omega conforme orientação'],
  },
  p4: {
    photo: 'https://images.unsplash.com/photo-1573865526739-10aa526f935c?auto=format&fit=crop&w=900&q=80',
    age: '3 anos',
    mood: 'Levemente ansiosa (espirros)',
    iaNote: 'Correlacionar espirros com mudança de estação; bom candidato a teleorientação.',
    health: [66, 64, 63, 65, 67, 68, 70, 71],
    vaccines: [{ name: 'Antirrábica', due: 'Em dia', status: 'ok' }],
    exams: ['Teste de alergia (solicitado)'],
    prescriptions: ['Antihistamínico uso eventual'],
  },
}
