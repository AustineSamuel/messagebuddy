import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

export function registerChatRulesRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.ChatRules, 'index'])
      router.get('default', [controllers.ChatRules, 'showDefault'])
      router.put('default', [controllers.ChatRules, 'updateDefault'])
      router.get(':chatId', [controllers.ChatRules, 'show'])
      router.put(':chatId', [controllers.ChatRules, 'update'])
    })
    .prefix('chat-rules')
    .as('chatRules')
    .use(middleware.auth())
}
