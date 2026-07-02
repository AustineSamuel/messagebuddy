import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

export function registerProductsRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.Products, 'index'])
      router.get(':id', [controllers.Products, 'show'])
      router.post('/', [controllers.Products, 'store'])
      router.put(':id', [controllers.Products, 'update'])
      router.delete(':id', [controllers.Products, 'destroy'])
    })
    .prefix('products')
    .as('products')
    .use(middleware.auth())

  router
    .group(() => {
      router.get(':userId/products/:slug', [controllers.Products, 'publicShow'])
      router.post(':userId/products/:slug/checkout', [controllers.Products, 'checkoutIntent'])
    })
    .prefix('store')
    .as('store')
}
