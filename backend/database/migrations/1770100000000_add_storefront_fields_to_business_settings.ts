import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'business_settings'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('slug', 80).nullable().unique()
      table.string('phone', 32).nullable()
      table.text('logo_url').nullable()
      table.string('tagline', 255).nullable()
      table.string('seo_title', 120).nullable()
      table.text('seo_description').nullable()
      table.string('accent_color', 16).nullable().defaultTo('#25D366')
      table.boolean('public_store_enabled').notNullable().defaultTo(true)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('slug')
      table.dropColumn('phone')
      table.dropColumn('logo_url')
      table.dropColumn('tagline')
      table.dropColumn('seo_title')
      table.dropColumn('seo_description')
      table.dropColumn('accent_color')
      table.dropColumn('public_store_enabled')
    })
  }
}
