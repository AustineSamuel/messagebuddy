import router from '@adonisjs/core/services/router'
import { registerAuthRoutes, registerUsersRoutes, registerWhatsappRoutes, registerChatRulesRoutes, registerFollowUpsRoutes, registerBusinessSettingsRoutes, registerCreditsRoutes, registerAnalyticsRoutes } from '#start/modules'

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
      registerFollowUpsRoutes()
      registerBusinessSettingsRoutes()
      registerCreditsRoutes()
      registerAnalyticsRoutes()
    })
    .prefix('/api/v1')
}
