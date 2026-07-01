import type { HttpContext } from '@adonisjs/core/http'
import CreditsService, { InsufficientCreditsError } from '../services/credits_service.js'

function getUserId(ctx: HttpContext) {
  return ctx.auth.getUserOrFail().id
}

export default class CreditsController {
  /** GET /api/v1/credits — balance, rates, and today's usage */
  async show(ctx: HttpContext) {
    return ctx.serialize(await CreditsService.getAccount(getUserId(ctx)))
  }

  /** GET /api/v1/credits/usage?days=7 — daily credits chart data */
  async usage(ctx: HttpContext) {
    const days = Math.min(Math.max(Number(ctx.request.input('days', 7)), 1), 90)
    return ctx.serialize(await CreditsService.getDailyUsage(getUserId(ctx), days))
  }

  /**
   * POST /api/v1/credits/purchase
   * Body: { credits: 100 | 500 | 1000 | ... } — must be multiple of 100.
   * MVP: credits are granted immediately (payment gateway TBD).
   */
  async purchase(ctx: HttpContext) {
    const credits = Number(ctx.request.input('credits'))
    if (!Number.isFinite(credits) || credits <= 0) {
      return ctx.response.badRequest({ message: 'Invalid credits amount.' })
    }

    try {
      const result = await CreditsService.purchaseCredits(getUserId(ctx), credits)
      return ctx.serialize(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Purchase failed'
      return ctx.response.badRequest({ message })
    }
  }
}

export { InsufficientCreditsError }
