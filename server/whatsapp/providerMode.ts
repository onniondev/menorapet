import { getEvolutionConfigError } from '../evolution/evolutionClient'

/** Padrão: Evolution (QR Code, número da clínica). Use WHATSAPP_PROVIDER=meta só se quiser API oficial Meta. */
export function getWhatsAppProviderMode(): 'meta' | 'evolution' {
  const forced = (process.env.WHATSAPP_PROVIDER ?? 'evolution').toLowerCase()
  if (forced === 'meta' || forced === 'meta_cloud') return 'meta'
  if (forced === 'evolution') return 'evolution'
  return 'evolution'
}

export function evolutionConfigured(): boolean {
  return !getEvolutionConfigError()
}
