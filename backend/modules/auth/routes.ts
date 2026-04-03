import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

/**
 * Auth routes: signup, login, logout under `/auth`.
 */
export function registerAuthRoutes() {
  router
    .group(() => {
      router.post('signup', [controllers.NewAccount, 'store'])
      router.post('login', [controllers.AccessToken, 'store'])
      router.post('firebase', [controllers.FirebaseAuths, 'store'])
      router.post('logout', [controllers.AccessToken, 'destroy']).use(middleware.auth())
    })
    .prefix('auth')
    .as('auth')
}
