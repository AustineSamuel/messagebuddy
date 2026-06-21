import type { HttpContext } from '@adonisjs/core/http'
import whatsAppClientManager from '../services/whatsapp_client_manager.js'

export function getAuthUserId(ctx: HttpContext): number {
  return ctx.auth.getUserOrFail().id
}

export async function requireReadyClient(ctx: HttpContext) {
  const userId = getAuthUserId(ctx)
  const client = await whatsAppClientManager.getReadyClient(userId)
  return { userId, client }
}

export function requireSession(ctx: HttpContext) {
  const userId = getAuthUserId(ctx)
  return { userId, session: whatsAppClientManager.getSession(userId) }
}