import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

export function registerFollowUpsRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.FollowUps, 'index'])
      router.put('sync', [controllers.FollowUps, 'sync'])
      router.patch(':chatId', [controllers.FollowUps, 'update'])
    })
    .prefix('follow-ups')
    .as('followUps')
    .use(middleware.auth())
}
