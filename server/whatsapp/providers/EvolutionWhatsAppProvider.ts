import * as evolution from '../../evolution/evolutionService.ts'
import type { SendTextResult, WhatsAppConnectionState, WhatsAppProvider } from './WhatsAppProvider.ts'

export class EvolutionWhatsAppProvider implements WhatsAppProvider {
  readonly providerId = 'evolution' as const

  constructor(private instanceName: string) {}

  async sendTextMessage(to: string, text: string): Promise<SendTextResult> {
    const res = await evolution.sendTextMessage(this.instanceName, to, text)
    if (!res.ok) return { ok: false, error: res.error }
    const id = (res.data as { key?: { id?: string } })?.key?.id ?? ''
    return { ok: true, messageId: id }
  }

  async sendMediaMessage(to: string, mediaUrl: string, caption?: string): Promise<SendTextResult> {
    const res = await evolution.sendMediaMessage(this.instanceName, to, mediaUrl, caption)
    if (!res.ok) return { ok: false, error: res.error }
    const id = (res.data as { key?: { id?: string } })?.key?.id ?? ''
    return { ok: true, messageId: id }
  }

  async getStatus(): Promise<WhatsAppConnectionState> {
    const res = await evolution.getConnectionState(this.instanceName)
    if (!res.ok) return 'error'
    const state = (res.data as { instance?: { state?: string }; state?: string })?.instance?.state ?? (res.data as { state?: string })?.state
    return evolution.mapEvolutionState(state)
  }

  async connect() {
    const res = await evolution.connectInstance(this.instanceName)
    if (!res.ok) return { status: 'error' as const, qrCode: null }
    return { status: 'qrcode' as const, qrCode: evolution.extractQrFromConnect(res.data) }
  }

  async disconnect() {
    await evolution.logoutInstance(this.instanceName)
  }
}
