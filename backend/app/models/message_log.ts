import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export type MessageLogSource = 'manual' | 'auto_reply' | 'follow_up'

export default class MessageLog extends BaseModel {
  static table = 'message_logs'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare chatId: string

  @column()
  declare chatLabel: string | null

  @column()
  declare source: MessageLogSource

  @column()
  declare bodyPreview: string | null

  @column()
  declare creditsCharged: number

  @column()
  declare isAi: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
