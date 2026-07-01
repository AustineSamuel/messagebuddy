import type { HttpContext } from '@adonisjs/core/http'
import FollowUpService from '../services/follow_up_service.js'
import type { FollowUpInterval } from '#models/follow_up_schedule'

function getUserId(ctx: HttpContext) {
  return ctx.auth.getUserOrFail().id
}

const VALID_INTERVALS: FollowUpInterval[] = ['daily', 'weekly', 'every_3_days']

export default class FollowUpsController {
  async index(ctx: HttpContext) {
    return ctx.serialize(await FollowUpService.listForUser(getUserId(ctx)))
  }

  async sync(ctx: HttpContext) {
    const body = ctx.request.body() as {
      interval?: FollowUpInterval
      chatIds?: string[]
      contacts?: Array<{ chatId: string; interval?: FollowUpInterval }>
      enabled?: boolean
    }

    const defaultInterval = body.interval ?? 'every_3_days'
    if (!VALID_INTERVALS.includes(defaultInterval)) {
      return ctx.response.badRequest({ message: 'Invalid follow-up interval.' })
    }

    const contacts = Array.isArray(body.contacts)
      ? body.contacts
          .filter((item) => item?.chatId)
          .map((item) => ({
            chatId: item.chatId,
            interval:
              item.interval && VALID_INTERVALS.includes(item.interval)
                ? item.interval
                : defaultInterval,
          }))
      : (Array.isArray(body.chatIds) ? body.chatIds.filter(Boolean) : []).map((chatId) => ({
          chatId,
          interval: defaultInterval,
        }))

    const saved = await FollowUpService.syncForUser(getUserId(ctx), {
      contacts,
      enabled: body.enabled,
    })

    return ctx.serialize(saved)
  }

  async update(ctx: HttpContext) {
    const body = ctx.request.body() as {
      enabled?: boolean
      interval?: FollowUpInterval
    }

    if (body.enabled !== undefined && typeof body.enabled !== 'boolean') {
      return ctx.response.badRequest({ message: 'enabled must be a boolean.' })
    }

    if (body.interval !== undefined && !VALID_INTERVALS.includes(body.interval)) {
      return ctx.response.badRequest({ message: 'Invalid follow-up interval.' })
    }

    if (body.enabled === undefined && body.interval === undefined) {
      return ctx.response.badRequest({ message: 'Nothing to update.' })
    }

    const chatId = decodeURIComponent(ctx.params.chatId)
    const saved = await FollowUpService.updateForChat(getUserId(ctx), chatId, body)
    return ctx.serialize(saved)
  }
}
