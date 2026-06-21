import type { HttpContext } from '@adonisjs/core/http'
import { handleWhatsAppError } from '../helpers/handle_error.js'
import { getAuthUserId } from '../helpers/whatsapp_context.js'
import WhatsAppService from '../services/whatsapp_service.js'

const uid = (ctx: HttpContext) => getAuthUserId(ctx)

export default class WhatsappBroadcastsController {
  async index(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.getBroadcasts(uid(ctx)))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async show(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.getBroadcastById(uid(ctx), ctx.params.contactId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }
}
