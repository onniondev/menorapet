import { WhatsAppCloudService } from '../WhatsAppCloudService'
import type { SendTextResult, WhatsAppConnectionState, WhatsAppProvider } from './WhatsAppProvider'

export class MetaCloudWhatsAppProvider implements WhatsAppProvider {
  readonly providerId = 'meta_cloud' as const

  constructor(private phoneNumberId?: string) {}

  private service() {
    return new WhatsAppCloudService({ phoneNumberId: this.phoneNumberId })
  }

  async sendTextMessage(to: string, text: string): Promise<SendTextResult> {
    return this.service().sendTextMessage(to.replace(/@.*/, ''), text)
  }

  async getStatus(): Promise<WhatsAppConnectionState> {
    return 'connected'
  }
}
