import { getInstanceByName } from './providers/getProviderForClinic.ts'
import { EvolutionWhatsAppProvider } from './providers/EvolutionWhatsAppProvider.ts'
import { processInboundCore } from './processInboundCore.ts'
import { logWebhook, resolveClinicByInstanceName } from './repositories.ts'
import type { EvolutionInboundMessage } from '../evolution/parseEvolutionWebhook.ts'

export async function processEvolutionInboundMessage(msg: EvolutionInboundMessage): Promise<void> {
  const instance = await getInstanceByName(msg.instanceName)
  if (!instance) {
    await logWebhook(null, 'unknown_instance', msg.raw, `instance=${msg.instanceName}`)
    return
  }

  const clinic = await resolveClinicByInstanceName(msg.instanceName)
  if (!clinic) {
    await logWebhook(instance.clinic_id, 'clinic_not_found', msg.raw)
    return
  }

  const provider =
    instance.status === 'connected'
      ? new EvolutionWhatsAppProvider(instance.instance_name)
      : null

  await processInboundCore({
    clinic,
    instanceId: instance.id,
    remoteJid: msg.remoteJid,
    contactName: msg.contactName,
    messageId: msg.messageId,
    text: msg.text,
    raw: msg.raw,
    provider,
  })
}
