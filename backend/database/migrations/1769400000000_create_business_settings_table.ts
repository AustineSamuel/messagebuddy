import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'business_settings'

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
      table.string('name', 255).notNullable().defaultTo('')
      table.text('description').nullable()
      table.string('website', 512).nullable()
      table.text('address').nullable()
      table.text('ai_rules').nullable()
      table.string('response_language', 32).notNullable().defaultTo('auto')
      table.text('escalation_rules').nullable()
      table.string('tone', 32).notNullable().defaultTo('professional')
      table.jsonb('products').notNullable().defaultTo('[]')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
