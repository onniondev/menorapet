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

export type WhatsAppInstanceStatus = {
  status: string
  evolutionReachable?: boolean
  evolutionError?: string | null
  instance: {
    id: string
    instance_name: string
    phone_number: string | null
    status: string
    qr_code: string | null
  } | null
  phoneNumber: string | null
  qrCode: string | null
}

export async function apiConnectWhatsApp(clinicId: string, displayName?: string) {
  const res = await fetch(`${apiBase()}/api/whatsapp/connect`, {
    method: 'POST',
    headers: await authHeaders(clinicId),
    body: JSON.stringify({ displayName }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((json as { error?: string }).error ?? 'Erro ao conectar WhatsApp')
  return json as { ok: boolean; status: string; qrCode: string | null; instanceName: string }
}

export async function apiWhatsAppStatus(clinicId: string) {
  const res = await fetch(`${apiBase()}/api/whatsapp/status`, { headers: await authHeaders(clinicId) })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((json as { error?: string }).error ?? 'Erro ao consultar status')
  return json as WhatsAppInstanceStatus
}

export async function apiRefreshQrCode(clinicId: string) {
  const res = await fetch(`${apiBase()}/api/whatsapp/qrcode`, { headers: await authHeaders(clinicId) })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((json as { error?: string }).error ?? 'Erro ao obter QR Code')
  return json as { qrCode: string | null; status: string }
}

export async function apiLogoutWhatsApp(clinicId: string) {
  const res = await fetch(`${apiBase()}/api/whatsapp/logout`, {
    method: 'POST',
    headers: await authHeaders(clinicId),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((json as { error?: string }).error ?? 'Erro ao desconectar')
  return json
}

export async function apiDeleteWhatsAppInstance(clinicId: string) {
  const res = await fetch(`${apiBase()}/api/whatsapp/instance`, {
    method: 'DELETE',
    headers: await authHeaders(clinicId),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((json as { error?: string }).error ?? 'Erro ao remover instância')
  return json
}
