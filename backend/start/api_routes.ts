import router from '@adonisjs/core/services/router'
import { registerAuthRoutes, registerUsersRoutes, registerWhatsappRoutes } from '#start/modules'

/**
 * Versioned API surface: pulls in feature modules.
 */
export function registerApiV1Routes() {
  router
    .group(() => {
      registerAuthRoutes()
      registerUsersRoutes()
      registerWhatsappRoutes()
    })
    .prefix('/api/v1')
}
