import { getEvolutionConfigError } from '../evolution/evolutionClient'

/** Padrão: Meta Cloud (sem servidor Evolution). Use WHATSAPP_PROVIDER=evolution para QR Code. */
export function getWhatsAppProviderMode(): 'meta' | 'evolution' {
  const forced = (process.env.WHATSAPP_PROVIDER ?? 'meta').toLowerCase()
  if (forced === 'evolution') return 'evolution'
  if (forced === 'meta' || forced === 'meta_cloud') return 'meta'
  if (getEvolutionConfigError()) return 'meta'
  return 'meta'
}
