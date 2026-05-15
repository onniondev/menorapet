export type WhatsAppConnectionState = 'disconnected' | 'connecting' | 'connected' | 'qrcode' | 'error'

export type SendTextResult = { ok: true; messageId: string } | { ok: false; error: string }

export interface WhatsAppProvider {
  readonly providerId: 'evolution' | 'meta_cloud'

  sendTextMessage(to: string, text: string): Promise<SendTextResult>
  sendMediaMessage?(to: string, mediaUrl: string, caption?: string): Promise<SendTextResult>
  getStatus(): Promise<WhatsAppConnectionState>
  connect?(): Promise<{ qrCode?: string | null; status: WhatsAppConnectionState }>
  disconnect?(): Promise<void>
}
