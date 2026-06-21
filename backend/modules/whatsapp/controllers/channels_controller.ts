import type { HttpContext } from '@adonisjs/core/http'
import { handleWhatsAppError } from '../helpers/handle_error.js'
import { getAuthUserId } from '../helpers/whatsapp_context.js'
import WhatsAppService from '../services/whatsapp_service.js'

const uid = (ctx: HttpContext) => getAuthUserId(ctx)

export default class WhatsappChannelsController {
  async index(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.getChannels(uid(ctx)))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async store(ctx: HttpContext) {
    try {
      const { title, options } = ctx.request.body()
      return ctx.serialize(await WhatsAppService.createChannel(uid(ctx), title, options))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async search(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.searchChannels(uid(ctx), ctx.request.body()))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async byInvite(ctx: HttpContext) {
    try {
      return ctx.serialize(
        await WhatsAppService.getChannelByInviteCode(uid(ctx), ctx.params.inviteCode)
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async destroy(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.deleteChannel(uid(ctx), ctx.params.channelId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async subscribe(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.subscribeToChannel(uid(ctx), ctx.params.channelId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async unsubscribe(ctx: HttpContext) {
    try {
      return ctx.serialize(
        await WhatsAppService.unsubscribeFromChannel(uid(ctx), ctx.params.channelId, ctx.request.body())
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async transferOwnership(ctx: HttpContext) {
    try {
      const { newOwnerId, options } = ctx.request.body()
      return ctx.serialize(
        await WhatsAppService.transferChannelOwnership(uid(ctx), ctx.params.channelId, newOwnerId, options)
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async sendAdminInvite(ctx: HttpContext) {
    try {
      const { chatId, options } = ctx.request.body()
      return ctx.serialize(
        await WhatsAppService.sendChannelAdminInvite(uid(ctx), chatId, ctx.params.channelId, options)
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async acceptAdminInvite(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.acceptChannelAdminInvite(uid(ctx), ctx.params.channelId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async revokeAdminInvite(ctx: HttpContext) {
    try {
      const { userId } = ctx.request.only(['userId'])
      return ctx.serialize(
        await WhatsAppService.revokeChannelAdminInvite(uid(ctx), ctx.params.channelId, userId)
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async demoteAdmin(ctx: HttpContext) {
    try {
      const { userId } = ctx.request.only(['userId'])
      return ctx.serialize(
        await WhatsAppService.demoteChannelAdmin(uid(ctx), ctx.params.channelId, userId)
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }
}
