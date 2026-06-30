import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export type ChatRuleType = 'always' | 'never' | 'custom' | 'default'

export const DEFAULT_CHAT_RULE_ID = '__default__'

export default class ChatRule extends BaseModel {
  static table = 'chat_rules'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare chatId: string

  @column()
  declare rule: ChatRuleType

  @column()
  declare notes: string | null

  @column()
  declare aiAutoReply: boolean

  @column()
  declare sendCatalog: boolean

  @column()
  declare notifyOnReply: boolean

  @column()
  declare customInstructions: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
