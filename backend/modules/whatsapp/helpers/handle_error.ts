import type { HttpContext } from '@adonisjs/core/http'

export function handleWhatsAppError(error: unknown, response: HttpContext['response']) {
  const message = error instanceof Error ? error.message : 'WhatsApp request failed.'
  const status = message.includes('not connected') ? 503 : 400
  return response.status(status).json({ error: message })
}
