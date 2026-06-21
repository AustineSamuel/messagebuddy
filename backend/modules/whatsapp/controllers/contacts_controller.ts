import type { HttpContext } from '@adonisjs/core/http'
import { handleWhatsAppError } from '../helpers/handle_error.js'
import { getAuthUserId } from '../helpers/whatsapp_context.js'
import WhatsAppService from '../services/whatsapp_service.js'

export default class WhatsappContactsController {
  async index(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.getContacts(getAuthUserId(ctx)))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async blocked(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.getBlockedContacts(getAuthUserId(ctx)))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async show(ctx: HttpContext) {
    try {
      return ctx.serialize(
        await WhatsAppService.getContactById(getAuthUserId(ctx), ctx.params.contactId)
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async block(ctx: HttpContext) {
    try {
      return ctx.serialize(
        await WhatsAppService.blockContact(getAuthUserId(ctx), ctx.params.contactId)
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async unblock(ctx: HttpContext) {
    try {
      return ctx.serialize(
        await WhatsAppService.unblockContact(getAuthUserId(ctx), ctx.params.contactId)
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async profilePic(ctx: HttpContext) {
    try {
      return ctx.serialize(
        await WhatsAppService.getProfilePicUrl(getAuthUserId(ctx), ctx.params.contactId)
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async commonGroups(ctx: HttpContext) {
    try {
      return ctx.serialize(
        await WhatsAppService.getCommonGroups(getAuthUserId(ctx), ctx.params.contactId)
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async about(ctx: HttpContext) {
    try {
      return ctx.serialize(
        await WhatsAppService.getContactAbout(getAuthUserId(ctx), ctx.params.contactId)
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async lookupNumber(ctx: HttpContext) {
    try {
      const { number } = ctx.request.only(['number'])
      return ctx.serialize({ id: await WhatsAppService.getNumberId(getAuthUserId(ctx), number) })
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async isRegistered(ctx: HttpContext) {
    try {
      const { id } = ctx.request.only(['id'])
      return ctx.serialize({ registered: await WhatsAppService.isRegisteredUser(getAuthUserId(ctx), id) })
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async formattedNumber(ctx: HttpContext) {
    try {
      const { number } = ctx.request.only(['number'])
      return ctx.serialize({ number: await WhatsAppService.getFormattedNumber(getAuthUserId(ctx), number) })
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async countryCode(ctx: HttpContext) {
    try {
      const { number } = ctx.request.only(['number'])
      return ctx.serialize({ countryCode: await WhatsAppService.getCountryCode(getAuthUserId(ctx), number) })
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async saveAddressbook(ctx: HttpContext) {
    try {
      const { phoneNumber, firstName, lastName, syncToAddressbook } = ctx.request.only([
        'phoneNumber',
        'firstName',
        'lastName',
        'syncToAddressbook',
      ])
      return ctx.serialize(
        await WhatsAppService.saveAddressbookContact(
          getAuthUserId(ctx),
          phoneNumber,
          firstName,
          lastName,
          syncToAddressbook
        )
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async deleteAddressbook(ctx: HttpContext) {
    try {
      const { phoneNumber } = ctx.request.only(['phoneNumber'])
      return ctx.serialize(await WhatsAppService.deleteAddressbookContact(getAuthUserId(ctx), phoneNumber))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }
}
