import type { HttpContext } from '@adonisjs/core/http'
import AnalyticsService, { type AnalyticsPeriod } from '../services/analytics_service.js'
import CreditsService from '../../credits/services/credits_service.js'

function getUserId(ctx: HttpContext) {
  return ctx.auth.getUserOrFail().id
}

const VALID_PERIODS: AnalyticsPeriod[] = ['today', '7d', '30d']

export default class AnalyticsController {
  /** GET /api/v1/analytics/summary?period=7d */
  async summary(ctx: HttpContext) {
    const period = (ctx.request.input('period', '7d') as AnalyticsPeriod) || '7d'
    const safePeriod = VALID_PERIODS.includes(period) ? period : '7d'
    const userId = getUserId(ctx)

    const [summary, account] = await Promise.all([
      AnalyticsService.getSummary(userId, safePeriod),
      CreditsService.getAccount(userId),
    ])

    return ctx.serialize({
      ...summary,
      balance: account.balance,
      signupGrant: account.signupGrant,
      creditsPerMessage: account.creditsPerMessage,
    })
  }

  /** GET /api/v1/analytics/hourly — message volume by hour (today) */
  async hourly(ctx: HttpContext) {
    return ctx.serialize({
      hours: await AnalyticsService.getHourlyVolumeToday(getUserId(ctx)),
    })
  }

  /** GET /api/v1/analytics/top-contacts?period=7d&limit=5 */
  async topContacts(ctx: HttpContext) {
    const period = (ctx.request.input('period', '7d') as AnalyticsPeriod) || '7d'
    const safePeriod = VALID_PERIODS.includes(period) ? period : '7d'
    const limit = Math.min(Math.max(Number(ctx.request.input('limit', 5)), 1), 20)

    return ctx.serialize(
      await AnalyticsService.getTopContacts(getUserId(ctx), safePeriod, limit)
    )
  }

  /** GET /api/v1/analytics/recent-messages?limit=8 */
  async recentMessages(ctx: HttpContext) {
    const limit = Math.min(Math.max(Number(ctx.request.input('limit', 8)), 1), 50)
    return ctx.serialize(await AnalyticsService.getRecentMessages(getUserId(ctx), limit))
  }
}
