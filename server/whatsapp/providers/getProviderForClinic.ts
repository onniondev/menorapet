import { query } from '../../db/pool'
import { EvolutionWhatsAppProvider } from './EvolutionWhatsAppProvider'
import type { WhatsAppProvider } from './WhatsAppProvider'

export type WhatsAppInstanceRow = {
  id: string
  clinic_id: string
  provider: string
  instance_name: string
  phone_number: string | null
  status: string
}

export async function getInstanceByClinic(clinicId: string): Promise<WhatsAppInstanceRow | null> {
  const { rows } = await query<WhatsAppInstanceRow>(
    `select id, clinic_id, provider, instance_name, phone_number, status
     from public.whatsapp_instances where clinic_id = $1 order by updated_at desc limit 1`,
    [clinicId],
  )
  return rows[0] ?? null
}

export async function getInstanceByName(instanceName: string): Promise<WhatsAppInstanceRow | null> {
  const { rows } = await query<WhatsAppInstanceRow>(
    `select id, clinic_id, provider, instance_name, phone_number, status
     from public.whatsapp_instances where instance_name = $1 limit 1`,
    [instanceName],
  )
  return rows[0] ?? null
}

export async function getProviderForClinic(clinicId: string): Promise<{ provider: WhatsAppProvider; instance: WhatsAppInstanceRow } | null> {
  const { rows } = await query<WhatsAppInstanceRow & { whatsapp_phone_number_id: string | null }>(
    `select i.id, i.clinic_id, i.provider, i.instance_name, i.phone_number, i.status,
            c.whatsapp_phone_number_id
     from public.whatsapp_instances i
     join public.clinics c on c.id = i.clinic_id
     where i.clinic_id = $1
     order by i.updated_at desc limit 1`,
    [clinicId],
  )
  const row = rows[0]
  if (!row || row.status !== 'connected') return null
  if (row.provider === 'evolution') {
    return { provider: new EvolutionWhatsAppProvider(row.instance_name), instance: row }
  }
  if (row.provider === 'meta_cloud') {
    const phoneId = row.whatsapp_phone_number_id?.trim() || process.env.META_PHONE_NUMBER_ID?.trim()
    if (!phoneId) return null
    const { MetaCloudWhatsAppProvider } = await import('./MetaCloudWhatsAppProvider')
    return { provider: new MetaCloudWhatsAppProvider(phoneId), instance: row }
  }
  return null
}
