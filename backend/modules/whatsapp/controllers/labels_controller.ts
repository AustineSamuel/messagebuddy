import type { HttpContext } from '@adonisjs/core/http'
import { handleWhatsAppError } from '../helpers/handle_error.js'
import { getAuthUserId } from '../helpers/whatsapp_context.js'
import WhatsAppService from '../services/whatsapp_service.js'

const uid = (ctx: HttpContext) => getAuthUserId(ctx)

export default class WhatsappLabelsController {
  async index(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.getLabels(uid(ctx)))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async show(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.getLabelById(uid(ctx), ctx.params.labelId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async chats(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.getChatsByLabelId(uid(ctx), ctx.params.labelId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async assign(ctx: HttpContext) {
    try {
      const { labelIds, chatIds } = ctx.request.only(['labelIds', 'chatIds'])
      return ctx.serialize(await WhatsAppService.addOrRemoveLabels(uid(ctx), labelIds, chatIds))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }
}
