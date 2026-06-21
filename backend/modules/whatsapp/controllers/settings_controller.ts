import type { HttpContext } from '@adonisjs/core/http'
import { handleWhatsAppError } from '../helpers/handle_error.js'
import { getAuthUserId } from '../helpers/whatsapp_context.js'
import WhatsAppService from '../services/whatsapp_service.js'

const uid = (ctx: HttpContext) => getAuthUserId(ctx)

export default class WhatsappSettingsController {
  async autoDownloadAudio(ctx: HttpContext) {
    try {
      const { enabled } = ctx.request.only(['enabled'])
      return ctx.serialize(await WhatsAppService.setAutoDownloadAudio(uid(ctx), enabled))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async autoDownloadDocuments(ctx: HttpContext) {
    try {
      const { enabled } = ctx.request.only(['enabled'])
      return ctx.serialize(await WhatsAppService.setAutoDownloadDocuments(uid(ctx), enabled))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async autoDownloadPhotos(ctx: HttpContext) {
    try {
      const { enabled } = ctx.request.only(['enabled'])
      return ctx.serialize(await WhatsAppService.setAutoDownloadPhotos(uid(ctx), enabled))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async autoDownloadVideos(ctx: HttpContext) {
    try {
      const { enabled } = ctx.request.only(['enabled'])
      return ctx.serialize(await WhatsAppService.setAutoDownloadVideos(uid(ctx), enabled))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async backgroundSync(ctx: HttpContext) {
    try {
      const { enabled } = ctx.request.only(['enabled'])
      return ctx.serialize(await WhatsAppService.setBackgroundSync(uid(ctx), enabled))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }
}
