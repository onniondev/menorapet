import { query } from '../db/pool.ts'
import * as evolution from './evolutionService.ts'
import { buildInstanceName, extractQrFromConnect, mapEvolutionState, setWebhook } from './evolutionService.ts'

export type InstanceRow = {
  id: string
  clinic_id: string
  provider: string
  instance_name: string
  display_name: string | null
  phone_number: string | null
  status: string
  qr_code: string | null
  last_connected_at: string | null
}

export async function getOrCreateInstanceRecord(clinicId: string, displayName?: string): Promise<InstanceRow> {
  const { rows: existing } = await query<InstanceRow>(
    `select id, clinic_id, provider, instance_name, display_name, phone_number, status, qr_code, last_connected_at::text
     from public.whatsapp_instances where clinic_id = $1 order by created_at desc limit 1`,
    [clinicId],
  )
  if (existing[0]) return existing[0]

  const instanceName = buildInstanceName(clinicId)
  const { rows } = await query<InstanceRow>(
    `insert into public.whatsapp_instances (clinic_id, provider, instance_name, display_name, status)
     values ($1, 'evolution', $2, $3, 'connecting')
     returning id, clinic_id, provider, instance_name, display_name, phone_number, status, qr_code, last_connected_at::text`,
    [clinicId, instanceName, displayName ?? 'WhatsApp da clínica'],
  )
  return rows[0]!
}

export async function updateInstance(
  id: string,
  patch: Partial<{
    status: string
    qr_code: string | null
    phone_number: string | null
    connection_data: unknown
    last_connected_at: Date | null
    last_disconnected_at: Date | null
  }>,
) {
  const fields: string[] = []
  const values: unknown[] = [id]
  let i = 2
  if (patch.status !== undefined) {
    fields.push(`status = $${i++}`)
    values.push(patch.status)
  }
  if (patch.qr_code !== undefined) {
    fields.push(`qr_code = $${i++}`)
    values.push(patch.qr_code)
  }
  if (patch.phone_number !== undefined) {
    fields.push(`phone_number = $${i++}`)
    values.push(patch.phone_number)
  }
  if (patch.connection_data !== undefined) {
    fields.push(`connection_data = $${i++}::jsonb`)
    values.push(JSON.stringify(patch.connection_data))
  }
  if (patch.last_connected_at !== undefined) {
    fields.push(`last_connected_at = $${i++}`)
    values.push(patch.last_connected_at)
  }
  if (patch.last_disconnected_at !== undefined) {
    fields.push(`last_disconnected_at = $${i++}`)
    values.push(patch.last_disconnected_at)
  }
  if (!fields.length) return
  await query(`update public.whatsapp_instances set ${fields.join(', ')}, updated_at = now() where id = $1`, values)
}

export async function connectClinicWhatsApp(clinicId: string, displayName?: string) {
  const record = await getOrCreateInstanceRecord(clinicId, displayName)
  const instanceName = record.instance_name

  await evolution.createInstance(clinicId, displayName).catch(() => {})
  await setWebhook(instanceName)

  const connectRes = await evolution.connectInstance(instanceName)
  const qr = connectRes.ok ? extractQrFromConnect(connectRes.data) : null

  await updateInstance(record.id, {
    status: qr ? 'qrcode' : 'connecting',
    qr_code: qr,
  })

  return { instance: record, qrCode: qr, status: qr ? 'qrcode' : 'connecting' }
}

export async function syncClinicWhatsAppStatus(clinicId: string) {
  const { rows } = await query<InstanceRow>(
    `select id, clinic_id, provider, instance_name, display_name, phone_number, status, qr_code, last_connected_at::text
     from public.whatsapp_instances where clinic_id = $1 order by updated_at desc limit 1`,
    [clinicId],
  )
  const record = rows[0]
  if (!record) return { status: 'disconnected' as const, instance: null }

  const stateRes = await evolution.getConnectionState(record.instance_name)
  const remote = stateRes.ok
    ? mapEvolutionState(
        (stateRes.data as { instance?: { state?: string } })?.instance?.state ?? (stateRes.data as { state?: string })?.state,
      )
    : record.status

  if (remote === 'connected' && record.status !== 'connected') {
    await updateInstance(record.id, { status: 'connected', last_connected_at: new Date(), qr_code: null })
  } else if (remote === 'disconnected') {
    await updateInstance(record.id, { status: 'disconnected', last_disconnected_at: new Date() })
  }

  const { rows: updated } = await query<InstanceRow>(
    `select id, clinic_id, provider, instance_name, display_name, phone_number, status, qr_code, last_connected_at::text
     from public.whatsapp_instances where id = $1`,
    [record.id],
  )
  return { status: updated[0]?.status ?? remote, instance: updated[0] ?? record }
}
