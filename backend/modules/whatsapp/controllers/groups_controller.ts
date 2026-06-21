import type { HttpContext } from '@adonisjs/core/http'
import type WAWebJS from 'whatsapp-web.js'
import { handleWhatsAppError } from '../helpers/handle_error.js'
import { getAuthUserId } from '../helpers/whatsapp_context.js'
import WhatsAppService from '../services/whatsapp_service.js'

const uid = (ctx: HttpContext) => getAuthUserId(ctx)

export default class WhatsappGroupsController {
  async store(ctx: HttpContext) {
    try {
      const { title, participants, options } = ctx.request.body()
      return ctx.serialize(await WhatsAppService.createGroup(uid(ctx), title, participants, options))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async inviteInfo(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.getInviteInfo(uid(ctx), ctx.params.inviteCode))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async join(ctx: HttpContext) {
    try {
      const { inviteCode } = ctx.request.only(['inviteCode'])
      return ctx.serialize(await WhatsAppService.acceptInvite(uid(ctx), inviteCode))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async joinV4(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.acceptGroupV4Invite(uid(ctx), ctx.request.body()))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async inviteCode(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.getGroupInviteCode(uid(ctx), ctx.params.groupId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async revokeInvite(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.revokeGroupInvite(uid(ctx), ctx.params.groupId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async leave(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.leaveGroup(uid(ctx), ctx.params.groupId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async addParticipants(ctx: HttpContext) {
    try {
      const { participantIds, options } = ctx.request.body()
      return ctx.serialize(
        await WhatsAppService.addGroupParticipants(uid(ctx), ctx.params.groupId, participantIds, options)
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async removeParticipants(ctx: HttpContext) {
    try {
      const { participantIds } = ctx.request.only(['participantIds'])
      return ctx.serialize(
        await WhatsAppService.removeGroupParticipants(uid(ctx), ctx.params.groupId, participantIds)
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async promoteParticipants(ctx: HttpContext) {
    try {
      const { participantIds } = ctx.request.only(['participantIds'])
      return ctx.serialize(
        await WhatsAppService.promoteGroupParticipants(uid(ctx), ctx.params.groupId, participantIds)
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async demoteParticipants(ctx: HttpContext) {
    try {
      const { participantIds } = ctx.request.only(['participantIds'])
      return ctx.serialize(
        await WhatsAppService.demoteGroupParticipants(uid(ctx), ctx.params.groupId, participantIds)
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async setSubject(ctx: HttpContext) {
    try {
      const { subject } = ctx.request.only(['subject'])
      return ctx.serialize(await WhatsAppService.setGroupSubject(uid(ctx), ctx.params.groupId, subject))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async setDescription(ctx: HttpContext) {
    try {
      const { description } = ctx.request.only(['description'])
      return ctx.serialize(
        await WhatsAppService.setGroupDescription(uid(ctx), ctx.params.groupId, description)
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async setPicture(ctx: HttpContext) {
    try {
      const { media } = ctx.request.only(['media'])
      return ctx.serialize(await WhatsAppService.setGroupPicture(uid(ctx), ctx.params.groupId, media))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async deletePicture(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.deleteGroupPicture(uid(ctx), ctx.params.groupId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async membershipRequests(ctx: HttpContext) {
    try {
      return ctx.serialize(await WhatsAppService.getGroupMembershipRequests(uid(ctx), ctx.params.groupId))
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async approveMembershipRequests(ctx: HttpContext) {
    try {
      return ctx.serialize(
        await WhatsAppService.approveGroupMembershipRequests(
          uid(ctx),
          ctx.params.groupId,
          ctx.request.body() as WAWebJS.MembershipRequestActionOptions
        )
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async rejectMembershipRequests(ctx: HttpContext) {
    try {
      return ctx.serialize(
        await WhatsAppService.rejectGroupMembershipRequests(
          uid(ctx),
          ctx.params.groupId,
          ctx.request.body() as WAWebJS.MembershipRequestActionOptions
        )
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async setInfoAdminsOnly(ctx: HttpContext) {
    try {
      const { adminsOnly } = ctx.request.only(['adminsOnly'])
      return ctx.serialize(
        await WhatsAppService.setGroupInfoAdminsOnly(uid(ctx), ctx.params.groupId, adminsOnly)
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async setMessagesAdminsOnly(ctx: HttpContext) {
    try {
      const { adminsOnly } = ctx.request.only(['adminsOnly'])
      return ctx.serialize(
        await WhatsAppService.setGroupMessagesAdminsOnly(uid(ctx), ctx.params.groupId, adminsOnly)
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }

  async setAddMembersAdminsOnly(ctx: HttpContext) {
    try {
      const { adminsOnly } = ctx.request.only(['adminsOnly'])
      return ctx.serialize(
        await WhatsAppService.setGroupAddMembersAdminsOnly(uid(ctx), ctx.params.groupId, adminsOnly)
      )
    } catch (error) {
      return handleWhatsAppError(error, ctx.response)
    }
  }
}
