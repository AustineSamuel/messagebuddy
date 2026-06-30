import router from '@adonisjs/core/services/router'
import { registerAuthRoutes, registerUsersRoutes, registerWhatsappRoutes, registerChatRulesRoutes } from '#start/modules'

/**
 * Versioned API surface: pulls in feature modules.
 */
export function registerApiV1Routes() {
  router
    .group(() => {
      registerAuthRoutes()
      registerUsersRoutes()
      registerWhatsappRoutes()
      registerChatRulesRoutes()
    })
    .prefix('/api/v1')
}
