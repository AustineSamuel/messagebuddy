import BusinessSettingsService from '../../modules/business_settings/services/business_settings_service.js'
import ProductsService from '../../modules/products/services/products_service.js'

/** Business profile + live product catalog for AI prompts. */
export default class AiBusinessContextService {
  static async forUser(userId: number) {
    const settings = await BusinessSettingsService.getForUser(userId)
    const products = await ProductsService.getActiveForAi(userId)
    return {
      ...settings,
      products,
    }
  }
}
