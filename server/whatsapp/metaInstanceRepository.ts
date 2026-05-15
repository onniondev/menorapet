import { query } from '../db/pool'
import type { InstanceRow } from '../evolution/instanceRepository'
import { updateInstance } from '../evolution/instanceRepository'

export function metaEnvReady() {
  return Boolean(process.env.META_WHATSAPP_TOKEN?.trim())
}

export function defaultPhoneNumberId() {
  return process.env.META_PHONE_NUMBER_ID?.trim() ?? ''
}

export function appWebhookUrlMeta() {
  const app = (
    process.env.APP_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  ).replace(/\/$/, '')
  return app ? `${app}/api/webhooks/whatsapp` : ''
}

function metaInstanceName(clinicId: string) {
  return `meta_${clinicId.replace(/-/g, '').slice(0, 40)}`
}

export async function getClinicPhoneNumberId(clinicId: string): Promise<string | null> {
  const { rows } = await query<{ whatsapp_phone_number_id: string | null }>(
    `select whatsapp_phone_number_id from public.clinics where id = $1`,
    [clinicId],
  )
  return rows[0]?.whatsapp_phone_number_id?.trim() || defaultPhoneNumberId() || null
}

async function verifyMetaPhoneNumberId(phoneNumberId: string): Promise<string | null> {
  const token = process.env.META_WHATSAPP_TOKEN?.trim()
  if (!token) return 'META_WHATSAPP_TOKEN não configurado no servidor (Vercel)'
  const version = process.env.META_GRAPH_VERSION ?? 'v20.0'
  try {
    const res = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      const msg = (json as { error?: { message?: string } })?.error?.message ?? res.statusText
      return `Meta API: ${msg}`
    }
    return null
  } catch (e) {
    return (e as Error).message
  }
}

export async function connectMetaClinicWhatsApp(
  clinicId: string,
  opts?: { phoneNumberId?: string; displayName?: string; displayPhone?: string },
) {
  if (!metaEnvReady()) {
    throw new Error(
      'Configure META_WHATSAPP_TOKEN na Vercel (token permanente do app Meta → WhatsApp → API).',
    )
  }

  const phoneNumberId = (opts?.phoneNumberId?.trim() || defaultPhoneNumberId()).trim()
  if (!phoneNumberId) {
    throw new Error(
      'Informe o Phone Number ID da Meta (painel WhatsApp → API Setup) ou configure META_PHONE_NUMBER_ID na Vercel.',
    )
  }

  const verifyErr = await verifyMetaPhoneNumberId(phoneNumberId)
  if (verifyErr) throw new Error(verifyErr)

  await query(`update public.clinics set whatsapp_phone_number_id = $1 where id = $2`, [
    phoneNumberId,
    clinicId,
  ])

  const instanceName = metaInstanceName(clinicId)
  const displayName = opts?.displayName ?? 'WhatsApp Business (Meta)'

  await query(`delete from public.whatsapp_instances where clinic_id = $1`, [clinicId])

  const { rows } = await query<InstanceRow>(
    `insert into public.whatsapp_instances (
       clinic_id, provider, instance_name, display_name, phone_number, status, qr_code
     ) values ($1, 'meta_cloud', $2, $3, $4, 'connected', null)
     returning id, clinic_id, provider, instance_name, display_name, phone_number, status, qr_code, last_connected_at::text`,
    [clinicId, instanceName, displayName, opts?.displayPhone?.trim() || null],
  )

  return {
    instance: rows[0]!,
    status: 'connected' as const,
    provider: 'meta_cloud' as const,
    phoneNumberId,
  }
}

export async function syncMetaClinicWhatsAppStatus(clinicId: string) {
  const { rows: inst } = await query<InstanceRow>(
    `select id, clinic_id, provider, instance_name, display_name, phone_number, status, qr_code, last_connected_at::text
     from public.whatsapp_instances where clinic_id = $1 order by updated_at desc limit 1`,
    [clinicId],
  )
  const instance = inst[0]
  const phoneNumberId = await getClinicPhoneNumberId(clinicId)
  const tokenOk = metaEnvReady()
  const verifyTokenOk = Boolean(process.env.META_VERIFY_TOKEN?.trim())

  if (!tokenOk) {
    return {
      status: 'error' as const,
      instance,
      provider: 'meta_cloud' as const,
      phoneNumberId,
      metaError: 'META_WHATSAPP_TOKEN ausente na Vercel.',
      webhookUrl: appWebhookUrlMeta(),
      verifyTokenConfigured: verifyTokenOk,
    }
  }

  if (!phoneNumberId) {
    return {
      status: 'disconnected' as const,
      instance,
      provider: 'meta_cloud' as const,
      phoneNumberId: null,
      metaError: null,
      webhookUrl: appWebhookUrlMeta(),
      verifyTokenConfigured: verifyTokenOk,
    }
  }

  if (instance?.provider === 'meta_cloud' && instance.status === 'connected') {
    return {
      status: 'connected' as const,
      instance,
      provider: 'meta_cloud' as const,
      phoneNumberId,
      metaError: null,
      webhookUrl: appWebhookUrlMeta(),
      verifyTokenConfigured: verifyTokenOk,
    }
  }

  return {
    status: 'disconnected' as const,
    instance,
    provider: 'meta_cloud' as const,
    phoneNumberId,
    metaError: null,
    webhookUrl: appWebhookUrlMeta(),
    verifyTokenConfigured: verifyTokenOk,
  }
}

export async function disconnectMetaClinicWhatsApp(clinicId: string) {
  const { rows } = await query<{ id: string }>(
    `select id from public.whatsapp_instances where clinic_id = $1 and provider = 'meta_cloud' limit 1`,
    [clinicId],
  )
  if (rows[0]) {
    await updateInstance(rows[0].id, {
      status: 'disconnected',
      qr_code: null,
      last_disconnected_at: new Date(),
    })
  }
  return { ok: true, status: 'disconnected' as const }
}
