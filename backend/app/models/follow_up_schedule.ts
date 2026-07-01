import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export type FollowUpInterval = 'daily' | 'weekly' | 'every_3_days'

export default class FollowUpSchedule extends BaseModel {
  static table = 'follow_up_schedules'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare chatId: string

  @column()
  declare interval: FollowUpInterval

  @column()
  declare enabled: boolean

  @column.dateTime()
  declare lastSentAt: DateTime | null

  @column.dateTime()
  declare nextRunAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
