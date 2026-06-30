import type { HttpContext } from '@adonisjs/core/http'
import ChatRulesService from '../services/chat_rules_service.js'
import { DEFAULT_CHAT_RULE_ID } from '#models/chat_rule'

function getUserId(ctx: HttpContext) {
  return ctx.auth.getUserOrFail().id
}

export default class ChatRulesController {
  async index(ctx: HttpContext) {
    return ctx.serialize(await ChatRulesService.listForUser(getUserId(ctx)))
  }

  async showDefault(ctx: HttpContext) {
    return ctx.serialize(await ChatRulesService.getDefault(getUserId(ctx)))
  }

  async updateDefault(ctx: HttpContext) {
    const body = ctx.request.body()
    const saved = await ChatRulesService.upsert(getUserId(ctx), DEFAULT_CHAT_RULE_ID, body)
    return ctx.serialize(saved)
  }

  async show(ctx: HttpContext) {
    const chatId = decodeURIComponent(ctx.params.chatId)
    return ctx.serialize(await ChatRulesService.getForChat(getUserId(ctx), chatId))
  }

  async update(ctx: HttpContext) {
    const chatId = decodeURIComponent(ctx.params.chatId)
    const body = ctx.request.body()
    const saved = await ChatRulesService.upsert(getUserId(ctx), chatId, body)
    return ctx.serialize(saved)
  }
}
