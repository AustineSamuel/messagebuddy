import router from '@adonisjs/core/services/router'

export function registerCoreRoutes() {
  router.get('/', () => {
    return { hello: 'world' }
  })
}
