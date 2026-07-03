import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

export function registerStorefrontRoutes() {
  router
    .group(() => {
      router.get('business/:businessSlug', [controllers.Storefront, 'showBusiness'])
      router.get('business/:businessSlug/products/:productSlug', [
        controllers.Storefront,
        'showProduct',
      ])
      router.post('business/:businessSlug/products/:productSlug/checkout', [
        controllers.Storefront,
        'checkout',
      ])
    })
    .prefix('store')
    .as('storefront')
}
