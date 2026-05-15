import { WhatsAppCloudService } from '../WhatsAppCloudService'
import type { SendTextResult, WhatsAppConnectionState, WhatsAppProvider } from './WhatsAppProvider'

/** Provider oficial Meta — uso futuro quando a clínica tiver `provider = meta_cloud`. */
export class MetaCloudWhatsAppProvider implements WhatsAppProvider {
  readonly providerId = 'meta_cloud' as const
  private wa = new WhatsAppCloudService()

  async sendTextMessage(to: string, text: string): Promise<SendTextResult> {
    return this.wa.sendTextMessage(to.replace(/@.*/, ''), text)
  }

  async getStatus(): Promise<WhatsAppConnectionState> {
    return 'connected'
  }
}
