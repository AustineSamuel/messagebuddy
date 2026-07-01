import type { HttpContext } from '@adonisjs/core/http'
import { InsufficientCreditsError } from '#services/credits_service'

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'WhatsApp request failed.'
}

function errorStatus(error: unknown, message: string) {
  if (error instanceof InsufficientCreditsError) return 402
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
  const status = errorStatus(error, message)
  const body: Record<string, unknown> = { error: message }
  if (error instanceof InsufficientCreditsError) {
    body.balance = error.balance
    body.required = error.required
  }
  return response.status(status).json(body)
}
