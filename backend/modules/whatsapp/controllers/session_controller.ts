import type { HttpContext } from '@adonisjs/core/http'
import { handleWhatsAppError } from '../helpers/handle_error.js'
import { getAuthUserId, requireSession } from '../helpers/whatsapp_context.js'
import WhatsAppService from '../services/whatsapp_service.js'

export default class WhatsappSessionController {
  async initialize(ctx: HttpContext) {
    const { serialize, response } = ctx
    try {
      const userId = getAuthUserId(ctx)
      await WhatsAppService.initialize(userId)
      return serialize(WhatsAppService.getSession(userId))
    } catch (error) {
      return handleWhatsAppError(error, response)
    }
  }

  async show(ctx: HttpContext) {
    const userId = getAuthUserId(ctx)
    return ctx.serialize(WhatsAppService.getSession(userId))
  }

  async state(ctx: HttpContext) {
    const { serialize, response } = ctx
    try {
      const userId = getAuthUserId(ctx)
      const state = await WhatsAppService.getState(userId)
      return serialize({ state })
    } catch (error) {
      return handleWhatsAppError(error, response)
    }
  }

  async qr(ctx: HttpContext) {
    const { session } = requireSession(ctx)
    return ctx.serialize({ qr: session.qr, status: session.status })
  }

  async destroy(ctx: HttpContext) {
    const { serialize, response } = ctx
    try {
      const userId = getAuthUserId(ctx)
      await WhatsAppService.destroy(userId)
      return serialize({ destroyed: true })
    } catch (error) {
      return handleWhatsAppError(error, response)
    }
  }

  async logout(ctx: HttpContext) {
    const { serialize, response } = ctx
    try {
      const userId = getAuthUserId(ctx)
      await WhatsAppService.logout(userId)
      return serialize({ loggedOut: true })
    } catch (error) {
      return handleWhatsAppError(error, response)
    }
  }

  async pairingCode(ctx: HttpContext) {
    const { request, serialize, response } = ctx
    try {
      const userId = getAuthUserId(ctx)
      const { phoneNumber, showNotification } = request.only(['phoneNumber', 'showNotification'])
      const code = await WhatsAppService.requestPairingCode(
        userId,
        phoneNumber,
        showNotification ?? true
      )
      return serialize({ pairingCode: code })
    } catch (error) {
      return handleWhatsAppError(error, response)
    }
  }

  async info(ctx: HttpContext) {
    const { serialize, response } = ctx
    try {
      const userId = getAuthUserId(ctx)
      return serialize(await WhatsAppService.getClientInfo(userId))
    } catch (error) {
      return handleWhatsAppError(error, response)
    }
  }

  async wwebVersion(ctx: HttpContext) {
    const { serialize, response } = ctx
    try {
      const userId = getAuthUserId(ctx)
      const version = await WhatsAppService.getWWebVersion(userId)
      return serialize({ version })
    } catch (error) {
      return handleWhatsAppError(error, response)
    }
  }
}
