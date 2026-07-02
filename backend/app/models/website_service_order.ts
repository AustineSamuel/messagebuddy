import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export type WebsiteOrderPaymentMethod = 'pay_now' | 'contact_me'
export type WebsiteOrderStatus = 'pending' | 'paid' | 'in_progress' | 'completed' | 'cancelled'

export default class WebsiteServiceOrder extends BaseModel {
  static table = 'website_service_orders'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare packageId: string

  @column()
  declare packageName: string

  @column()
  declare amountNgn: number

  @column()
  declare businessName: string | null

  @column()
  declare websiteUrl: string | null

  @column()
  declare contactName: string | null

  @column()
  declare contactPhone: string | null

  @column()
  declare contactEmail: string | null

  @column()
  declare notes: string | null

  @column()
  declare paymentMethod: WebsiteOrderPaymentMethod

  @column()
  declare status: WebsiteOrderStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
