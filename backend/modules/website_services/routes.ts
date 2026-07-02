import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

export function registerWebsiteServicesRoutes() {
  router
    .group(() => {
      router.get('packages', [controllers.WebsiteServices, 'packages'])
      router.get('orders/admin', [controllers.WebsiteServices, 'adminIndex'])
      router.get('orders', [controllers.WebsiteServices, 'myOrders'])
      router.post('orders', [controllers.WebsiteServices, 'store'])
    })
    .prefix('website-services')
    .as('websiteServices')
    .use(middleware.auth())
}
