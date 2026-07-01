import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

export function registerBusinessSettingsRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.BusinessSettings, 'show'])
      router.put('/', [controllers.BusinessSettings, 'update'])
    })
    .prefix('business-settings')
    .as('businessSettings')
    .use(middleware.auth())
}
