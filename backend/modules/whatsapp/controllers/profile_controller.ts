import type { HttpContext } from '@adonisjs/core/http'
import { handleWhatsAppError } from '../helpers/handle_error.js'
import { getAuthUserId } from '../helpers/whatsapp_context.js'
import WhatsAppService from '../services/whatsapp_service.js'

const uid = (ctx: HttpContext) => getAuthUserId(ctx)

export default class WhatsappProfileController {
  async setDisplayName(ctx: HttpContext) {
    try {
      const { displayName } = ctx.request.only(['displayName'])
      return ctx.serialize(await WhatsAppService.setDisplayName(uid(ctx), displayName))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async setStatus(ctx: HttpContext) {
    try {
      const { status } = ctx.request.only(['status'])
      return ctx.serialize(await WhatsAppService.setStatus(uid(ctx), status))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async setPicture(ctx: HttpContext) {
    try {
      const { media } = ctx.request.only(['media'])
      return ctx.serialize(await WhatsAppService.setProfilePicture(uid(ctx), media))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async deletePicture(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.deleteProfilePicture(uid(ctx)))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async presenceAvailable(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.sendPresenceAvailable(uid(ctx)))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async presenceUnavailable(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.sendPresenceUnavailable(uid(ctx)))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async revokeStatus(ctx: HttpContext) {
    try {
      return ctx.serialize(
        await WhatsAppService.revokeStatusMessage(uid(ctx), ctx.params.messageId)
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }
}
