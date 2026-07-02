import ProductsService, { type AiProduct } from '../../modules/products/services/products_service.js'

/** Ensures checkout links are included when a customer asks about products. */
export default class ProductReplyEnricher {
  /** Fresh DB lookup + relevance scoring for the customer's message. */
  static async findRelevantProducts(userId: number, message: string): Promise<AiProduct[]> {
    return ProductsService.searchActiveForCustomerMessage(userId, message)
  }

  static buildCheckoutLinkBlock(products: AiProduct[]): string {
    if (!products.length) return ''

    const lines = products.slice(0, 3).map((product) => {
      const emoji = product.emoji?.trim() ? `${product.emoji.trim()} ` : ''
      return `${emoji}${product.name} — ${product.price}\nTap to view details & checkout:\n${product.checkoutUrl}`
    })

    return `\n\n${lines.join('\n\n')}`
  }

  /** Append any checkout URLs the AI forgot to include. */
  static enrich(reply: string, products: AiProduct[]): string {
    if (!products.length) return reply

    const trimmed = reply.trim()
    const missing = products.filter((product) => !trimmed.includes(product.checkoutUrl))
    if (!missing.length) return trimmed

    return trimmed + this.buildCheckoutLinkBlock(missing)
  }
}
