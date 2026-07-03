import { BaseSchema } from '@adonisjs/lucid/schema'
import BusinessSetting from '#models/business_setting'
import {
  suggestBusinessSlug,
  uniqueBusinessSlug,
} from '../../modules/storefront/services/storefront_service.js'

export default class extends BaseSchema {
  async up() {
    const rows = await BusinessSetting.query().where((query) => {
      query.whereNull('slug').orWhere('slug', '')
    })

    for (const row of rows) {
      const name = row.name?.trim()
      if (!name) continue
      row.slug = await uniqueBusinessSlug(row.userId, suggestBusinessSlug(name), row.userId)
      await row.save()
    }
  }

  async down() {
    // Slugs may have been used publicly; do not remove on rollback.
  }
}
