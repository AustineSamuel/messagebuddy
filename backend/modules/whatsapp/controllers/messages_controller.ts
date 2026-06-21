import type { HttpContext } from '@adonisjs/core/http'
import { handleWhatsAppError } from '../helpers/handle_error.js'
import { getAuthUserId } from '../helpers/whatsapp_context.js'
import WhatsAppService from '../services/whatsapp_service.js'

const uid = (ctx: HttpContext) => getAuthUserId(ctx)

export default class WhatsappMessagesController {
  async search(ctx: HttpContext) {
    try {
      const { query, page, limit, chatId } = ctx.request.qs()
      return ctx.serialize(await WhatsAppService.searchMessages(uid(ctx), query, { page, limit, chatId }))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async show(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.getMessageById(uid(ctx), ctx.params.messageId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async store(ctx: HttpContext) {
    try {
      const { chatId, content, options } = ctx.request.body()
      return ctx.serialize(await WhatsAppService.sendMessage(uid(ctx), chatId, content, options))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async react(ctx: HttpContext) {
    try {
      const { reaction } = ctx.request.only(['reaction'])
      return ctx.serialize(await WhatsAppService.reactToMessage(uid(ctx), ctx.params.messageId, reaction))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async reply(ctx: HttpContext) {
    try {
      const body = ctx.request.body()
      return ctx.serialize(
        await WhatsAppService.replyToMessage(uid(ctx), ctx.params.messageId, body.content ?? body, body.options)
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async forward(ctx: HttpContext) {
    try {
      const { chatId } = ctx.request.only(['chatId'])
      return ctx.serialize(await WhatsAppService.forwardMessage(uid(ctx), ctx.params.messageId, chatId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async update(ctx: HttpContext) {
    try {
      const { content, options } = ctx.request.body()
      return ctx.serialize(await WhatsAppService.editMessage(uid(ctx), ctx.params.messageId, content, options))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async destroy(ctx: HttpContext) {
    try {
      const { everyone, clearMedia } = ctx.request.qs()
      return ctx.serialize(
        await WhatsAppService.deleteMessage(
          uid(ctx),
          ctx.params.messageId,
          everyone === 'true',
          clearMedia !== 'false'
        )
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async media(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.downloadMessageMedia(uid(ctx), ctx.params.messageId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async reactions(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.getMessageReactions(uid(ctx), ctx.params.messageId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async pollVotes(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.getPollVotes(uid(ctx), ctx.params.messageId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async star(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.starMessage(uid(ctx), ctx.params.messageId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async unstar(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.unstarMessage(uid(ctx), ctx.params.messageId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async pin(ctx: HttpContext) {
    try {
      const { duration } = ctx.request.only(['duration'])
      return ctx.serialize(await WhatsAppService.pinMessage(uid(ctx), ctx.params.messageId, duration))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async unpin(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.unpinMessage(uid(ctx), ctx.params.messageId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async vote(ctx: HttpContext) {
    try {
      const { selectedOptions } = ctx.request.only(['selectedOptions'])
      return ctx.serialize(await WhatsAppService.voteInPoll(uid(ctx), ctx.params.messageId, selectedOptions))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }
}
