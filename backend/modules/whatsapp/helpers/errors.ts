export class WhatsAppUnavailableError extends Error {
  readonly code = 'WHATSAPP_UNAVAILABLE'

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'WhatsAppUnavailableError'
  }
}
