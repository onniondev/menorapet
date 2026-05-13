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
