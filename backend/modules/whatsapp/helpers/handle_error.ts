import type { HttpContext } from '@adonisjs/core/http'
import { InsufficientCreditsError } from '#services/credits_service'
import logger from '@adonisjs/core/services/logger'
import { WhatsAppUnavailableError } from './errors.js'

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'WhatsApp request failed.'
}

function publicError(error: unknown, message: string) {
  if (error instanceof InsufficientCreditsError) {
    return { status: 402, code: 'INSUFFICIENT_CREDITS', message }
  }
  if (error instanceof WhatsAppUnavailableError) {
    return { status: 503, code: error.code, message: error.message }
  }
  if (message.toLowerCase().includes('not connected')) {
    return {
      status: 503,
      code: 'WHATSAPP_NOT_CONNECTED',
      message: 'WhatsApp is not connected yet. Connect your account and try again.',
    }
  }
  if (
    message.includes('protocolTimeout') ||
    message.includes('timed out') ||
    message.includes('Timeout')
  ) {
    return {
      status: 504,
      code: 'WHATSAPP_TIMEOUT',
      message: 'WhatsApp took too long to respond. Please wait a moment and try again.',
    }
  }
  if (
    message.includes('Execution context') ||
    message.includes('Protocol error') ||
    message.includes('Target closed') ||
    message.includes('Session closed') ||
    message.includes('Evaluation failed')
  ) {
    return {
      status: 503,
      code: 'WHATSAPP_CONNECTION_INTERRUPTED',
      message: 'The WhatsApp connection was interrupted. Please refresh the connection and try again.',
    }
  }
  if (message.includes('required') || message.includes('not a voice note')) {
    return { status: 400, code: 'INVALID_WHATSAPP_REQUEST', message }
  }
  return {
    status: 500,
    code: 'WHATSAPP_REQUEST_FAILED',
    message: 'We could not complete that WhatsApp request. Please try again.',
  }
}

export function handleWhatsAppError(error: unknown, response: HttpContext['response']) {
  const message = errorMessage(error)
  const publicResponse = publicError(error, message)
  const diagnosticError =
    error instanceof WhatsAppUnavailableError && error.cause ? error.cause : error
  logger.warn(
    { err: diagnosticError, code: publicResponse.code, status: publicResponse.status },
    'WhatsApp API request failed'
  )
  const body: Record<string, unknown> = {
    error: publicResponse.message,
    code: publicResponse.code,
    retryable: publicResponse.status >= 500,
  }
  if (error instanceof InsufficientCreditsError) {
    body.balance = error.balance
    body.required = error.required
  }
  return response.status(publicResponse.status).json(body)
}
