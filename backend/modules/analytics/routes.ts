import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

export function registerAnalyticsRoutes() {
  router
    .group(() => {
      router.get('summary', [controllers.Analytics, 'summary'])
      router.get('hourly', [controllers.Analytics, 'hourly'])
      router.get('top-contacts', [controllers.Analytics, 'topContacts'])
      router.get('recent-messages', [controllers.Analytics, 'recentMessages'])
    })
    .prefix('analytics')
    .as('analytics')
    .use(middleware.auth())
}
