import type { HttpContext } from '@adonisjs/core/http'

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'WhatsApp request failed.'
}

function errorStatus(message: string) {
  if (message.includes('not connected')) return 503
  if (
    message.includes('protocolTimeout') ||
    message.includes('timed out') ||
    message.includes('Timeout')
  ) {
    return 504
  }
  return 400
}

export function handleWhatsAppError(error: unknown, response: HttpContext['response']) {
  const message = errorMessage(error)
  return response.status(errorStatus(message)).json({ error: message })
}
