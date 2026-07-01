import type { HttpContext } from '@adonisjs/core/http'
import BusinessSettingsService from '../services/business_settings_service.js'

function getUserId(ctx: HttpContext) {
  return ctx.auth.getUserOrFail().id
}

export default class BusinessSettingsController {
  async show(ctx: HttpContext) {
    return ctx.serialize(await BusinessSettingsService.getForUser(getUserId(ctx)))
  }

  async update(ctx: HttpContext) {
    const body = ctx.request.body()
    const saved = await BusinessSettingsService.upsert(getUserId(ctx), body)
    return ctx.serialize(saved)
  }
}
