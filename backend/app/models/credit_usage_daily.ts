import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class CreditUsageDaily extends BaseModel {
  static table = 'credit_usage_daily'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column.date()
  declare usageDate: DateTime

  @column()
  declare creditsUsed: number

  @column()
  declare messagesSent: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
