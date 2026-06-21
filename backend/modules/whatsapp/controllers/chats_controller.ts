import type { HttpContext } from '@adonisjs/core/http'
import { handleWhatsAppError } from '../helpers/handle_error.js'
import { getAuthUserId } from '../helpers/whatsapp_context.js'
import WhatsAppService from '../services/whatsapp_service.js'

const uid = (ctx: HttpContext) => getAuthUserId(ctx)

export default class WhatsappChatsController {
  async index(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.getChats(uid(ctx)))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async show(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.getChatById(uid(ctx), ctx.params.chatId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async archive(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.archiveChat(uid(ctx), ctx.params.chatId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async unarchive(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.unarchiveChat(uid(ctx), ctx.params.chatId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async mute(ctx: HttpContext) {
    try {
      const { unmuteDate } = ctx.request.only(['unmuteDate'])
      return ctx.serialize(await WhatsAppService.muteChat(uid(ctx), ctx.params.chatId, unmuteDate))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async unmute(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.unmuteChat(uid(ctx), ctx.params.chatId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async pin(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.pinChat(uid(ctx), ctx.params.chatId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async unpin(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.unpinChat(uid(ctx), ctx.params.chatId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async markUnread(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.markChatUnread(uid(ctx), ctx.params.chatId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async clearMessages(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.clearChatMessages(uid(ctx), ctx.params.chatId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async destroy(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.deleteChat(uid(ctx), ctx.params.chatId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async messages(ctx: HttpContext) {
    try {
      const { limit, fromMe } = ctx.request.qs()
      return ctx.serialize(
        await WhatsAppService.fetchChatMessages(uid(ctx), ctx.params.chatId, {
          limit: limit ? Number(limit) : undefined,
          fromMe: fromMe === 'true' ? true : fromMe === 'false' ? false : undefined,
        })
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async pinnedMessages(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.getPinnedMessages(uid(ctx), ctx.params.chatId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async sendMessage(ctx: HttpContext) {
    try {
      const body = ctx.request.body()
      return ctx.serialize(
        await WhatsAppService.sendChatMessage(uid(ctx), ctx.params.chatId, body.content ?? body, body.options)
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async sendSeen(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.sendSeen(uid(ctx), ctx.params.chatId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async sendTyping(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.sendTyping(uid(ctx), ctx.params.chatId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async sendRecording(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.sendRecording(uid(ctx), ctx.params.chatId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async syncHistory(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.syncHistory(uid(ctx), ctx.params.chatId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async labels(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.getChatLabels(uid(ctx), ctx.params.chatId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async setLabels(ctx: HttpContext) {
    try {
      const { labelIds } = ctx.request.only(['labelIds'])
      return ctx.serialize(await WhatsAppService.setChatLabels(uid(ctx), ctx.params.chatId, labelIds))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async customerNote(ctx: HttpContext) {
    try {
      return ctx.serialize({
        note: await WhatsAppService.getCustomerNote(uid(ctx), ctx.params.chatId),
      })
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async setCustomerNote(ctx: HttpContext) {
    try {
      const { note } = ctx.request.only(['note'])
      return ctx.serialize(await WhatsAppService.setCustomerNote(uid(ctx), ctx.params.chatId, note))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }
}
