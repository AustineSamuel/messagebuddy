import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'website_service_orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('package_id', 32).notNullable()
      table.string('package_name', 120).notNullable()
      table.integer('amount_ngn').unsigned().notNullable()
      table.string('business_name', 255).nullable()
      table.string('website_url', 500).nullable()
      table.string('contact_name', 120).nullable()
      table.string('contact_phone', 40).nullable()
      table.string('contact_email', 255).nullable()
      table.text('notes').nullable()
      table.string('payment_method', 32).notNullable().defaultTo('contact_me')
      table.string('status', 32).notNullable().defaultTo('pending')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['user_id', 'created_at'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
