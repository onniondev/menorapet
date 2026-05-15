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
  const instance = await getInstanceByClinic(clinicId)
  if (!instance || instance.status !== 'connected') return null
  if (instance.provider === 'evolution') {
    return { provider: new EvolutionWhatsAppProvider(instance.instance_name), instance }
  }
  if (instance.provider === 'meta_cloud') {
    const { MetaCloudWhatsAppProvider } = await import('./MetaCloudWhatsAppProvider')
    return { provider: new MetaCloudWhatsAppProvider(), instance }
  }
  return null
}
