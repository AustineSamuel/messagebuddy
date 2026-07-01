import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

export function registerCreditsRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.Credits, 'show'])
      router.get('usage', [controllers.Credits, 'usage'])
      router.post('purchase', [controllers.Credits, 'purchase'])
    })
    .prefix('credits')
    .as('credits')
    .use(middleware.auth())
}
