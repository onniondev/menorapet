import { supabase } from '../lib/supabase'

const apiBase = () => import.meta.env.VITE_API_BASE_URL ?? ''

async function authHeaders(clinicId: string) {
  if (!supabase) throw new Error('Supabase não configurado')
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Faça login novamente')
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'x-clinic-id': clinicId,
  }
}

export type WhatsappConversationItem = {
  id: string
  client_id: string
  status: string
  queue: string
  assigned_to_id: string | null
  ai_assistance_enabled: boolean
  contact_name: string
  phone: string | null
  last_message_at: string
}

export async function apiListConversations(
  clinicId: string,
  opts?: { status?: string; queue?: string; unassigned?: boolean; q?: string },
) {
  const params = new URLSearchParams()
  if (opts?.status) params.set('status', opts.status)
  if (opts?.queue) params.set('queue', opts.queue)
  if (opts?.unassigned) params.set('unassigned', '1')
  if (opts?.q) params.set('q', opts.q)
  const qs = params.toString()
  const res = await fetch(`${apiBase()}/api/conversations${qs ? `?${qs}` : ''}`, {
    headers: await authHeaders(clinicId),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((json as { error?: string }).error ?? 'Erro ao listar conversas')
  return json as { conversations: WhatsappConversationItem[] }
}

export async function apiGetConversation(clinicId: string, conversationId: string) {
  const res = await fetch(`${apiBase()}/api/conversations/${conversationId}`, {
    headers: await authHeaders(clinicId),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((json as { error?: string }).error ?? 'Erro ao carregar conversa')
  return json as {
    conversation: WhatsappConversationItem
    messages: { id: string; direction: string; content: string; sender_type: string; created_at: string }[]
  }
}

export async function apiToggleConversationAi(clinicId: string, conversationId: string, enabled: boolean) {
  const res = await fetch(`${apiBase()}/api/conversations/${conversationId}/ai`, {
    method: 'POST',
    headers: await authHeaders(clinicId),
    body: JSON.stringify({ enabled }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((json as { error?: string }).error ?? 'Erro ao alterar IA')
  return json
}

export async function apiSendConversationMessage(clinicId: string, conversationId: string, text: string) {
  const res = await fetch(`${apiBase()}/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: await authHeaders(clinicId),
    body: JSON.stringify({ text }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((json as { error?: string }).error ?? 'Erro ao enviar mensagem WhatsApp')
  return json
}

export async function apiAssignConversation(clinicId: string, conversationId: string) {
  const res = await fetch(`${apiBase()}/api/conversations/${conversationId}/assign`, {
    method: 'POST',
    headers: await authHeaders(clinicId),
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error((json as { error?: string }).error ?? 'Erro ao assumir conversa')
  }
}

export async function apiCloseConversation(clinicId: string, conversationId: string) {
  const res = await fetch(`${apiBase()}/api/conversations/${conversationId}/close`, {
    method: 'POST',
    headers: await authHeaders(clinicId),
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error((json as { error?: string }).error ?? 'Erro ao encerrar conversa')
  }
}
