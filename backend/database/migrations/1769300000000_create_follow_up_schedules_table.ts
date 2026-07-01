import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'follow_up_schedules'

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
      table.string('chat_id', 255).notNullable()
      table.string('interval', 32).notNullable().defaultTo('every_3_days')
      table.boolean('enabled').notNullable().defaultTo(true)
      table.timestamp('last_sent_at').nullable()
      table.timestamp('next_run_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['user_id', 'chat_id'])
      table.index(['enabled', 'next_run_at'])
      table.index(['user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
