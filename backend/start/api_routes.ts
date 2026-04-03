import router from '@adonisjs/core/services/router'
import { registerAuthRoutes, registerUsersRoutes } from '#start/modules'

/**
 * Versioned API surface: pulls in feature modules.
 */
export function registerApiV1Routes() {
  router
    .group(() => {
      registerAuthRoutes()
      registerUsersRoutes()
    })
    .prefix('/api/v1')
}
