/**
 * Resolves AI prompt fields by skipping placeholders/empty values and
 * falling back: per-chat → default chat rules → built-in general instructions.
 */

const PLACEHOLDER_PATTERNS: RegExp[] = [
  /insert\s+(value|text|details?|name|price|info)/i,
  /insert\s+here/i,
  /\benter\s+(your|a|the)\b/i,
  /\badd\s+notes?\s+here\b/i,
  /\byour\s+text\s+here\b/i,
  /\bplaceholder\b/i,
  /^\[.+\]$/,
  /^\{.+\}$/,
  /^todo\b/i,
  /^tbd\b/i,
  /^n\/?a$/i,
  /^-+$/,
  /^\.{2,}$/,
  /lorem\s+ipsum/i,
  /^example\s*:/i,
  /^e\.g\.\s*$/i,
  /^fill\s+in\b/i,
  /^type\s+here\b/i,
  /^coming\s+soon\b/i,
]

export const GENERAL_AI_INSTRUCTIONS = `Be warm, professional, and helpful. Reply in the same language the customer uses. Keep messages short and suitable for WhatsApp. If you do not have specific product, price, or policy details, give a helpful general response and offer to follow up. Never use placeholders, brackets, or filler like "insert value here".`

const ANTI_PLACEHOLDER_RULE = `Never output placeholders, template brackets, or phrases like "insert value here", "[your name]", or "TBD". If you lack specific facts, respond naturally with general helpful language instead of leaving blanks.`

export function isUsableText(value: string | null | undefined): value is string {
  if (!value?.trim()) return false
  const text = value.trim()
  if (text.length < 3) return false
  return !PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(text))
}

export function pickUsableText(...candidates: (string | null | undefined)[]): string | null {
  for (const candidate of candidates) {
    if (isUsableText(candidate)) return candidate.trim()
  }
  return null
}

export type ResolveAiContextInput = {
  customInstructions?: string | null
  notes?: string | null
  defaultCustomInstructions?: string | null
  defaultNotes?: string | null
}

export type ResolvedAiContext = {
  customInstructions: string
  notes: string | null
}

export type BusinessAiContext = {
  name: string
  description: string | null
  website: string | null
  address: string | null
  aiRules: string | null
  responseLanguage: string
  escalationRules: string | null
  tone: string
  products: Array<{
    name: string
    slug?: string
    description?: string | null
    price: string
    stock: string
    emoji?: string
    checkoutUrl?: string
  }>
}

const STOCK_LABELS: Record<string, string> = {
  in: 'in stock',
  low: 'low stock',
  out: 'out of stock',
}

function responseLanguageRule(language: string): string | null {
  switch (language) {
    case 'english':
      return 'Always reply in English only, even if the customer writes in another language.'
    case 'yoruba':
      return 'Always reply in Yoruba only.'
    case 'igbo':
      return 'Always reply in Igbo only.'
    case 'hausa':
      return 'Always reply in Hausa only.'
    case 'pidgin':
      return 'Always reply in Nigerian Pidgin only.'
    default:
      return null
  }
}

export function formatBusinessIdentityBlock(business: BusinessAiContext): string | null {
  const lines: string[] = []
  if (isUsableText(business.name)) lines.push(`Business name: ${business.name.trim()}`)
  if (isUsableText(business.description))
    lines.push(`What we sell: ${business.description.trim()}`)
  if (isUsableText(business.website)) lines.push(`Website / store: ${business.website.trim()}`)
  if (isUsableText(business.address)) lines.push(`Address: ${business.address.trim()}`)
  if (!lines.length) return null
  return `BUSINESS YOU REPRESENT (use this identity in every reply):\n${lines.join('\n')}`
}

export function formatBusinessRulesBlock(business: BusinessAiContext): string | null {
  const parts: string[] = []
  if (isUsableText(business.aiRules)) parts.push(business.aiRules.trim())
  if (isUsableText(business.tone)) parts.push(`Communication tone: ${business.tone}`)
  const langRule = responseLanguageRule(business.responseLanguage)
  if (langRule) parts.push(langRule)
  if (isUsableText(business.escalationRules)) {
    parts.push(`Escalate to the business owner when: ${business.escalationRules.trim()}`)
  }
  if (!parts.length) return null
  return `GLOBAL BUSINESS AI RULES & INSTRUCTIONS:\n${parts.join('\n')}`
}

export function formatProductCatalogBlock(business: BusinessAiContext): string | null {
  const lines = business.products
    .filter((p) => isUsableText(p.name))
    .map((p) => {
      const stock = STOCK_LABELS[p.stock] ?? p.stock
      const emoji = p.emoji?.trim() ? `${p.emoji.trim()} ` : ''
      const price = isUsableText(p.price) ? p.price.trim() : 'price on request'
      const desc = isUsableText(p.description) ? ` — ${p.description.trim()}` : ''
      const link = p.checkoutUrl?.trim() ? ` | Checkout: ${p.checkoutUrl.trim()}` : ''
      return `- ${emoji}${p.name.trim()}: ${price} (${stock})${desc}${link}`
    })
  if (!lines.length) return null
  return `PRODUCT CATALOG (reference for pricing, availability, and checkout links):\n${lines.join('\n')}\nWhen a customer asks about buying or a specific product, share the matching checkout link on its own line and invite them to tap the link to view details and complete checkout.`
}

export function formatMatchedProductsBlock(
  products: BusinessAiContext['products']
): string | null {
  if (!products.length) return null
  const lines = products.map((p) => {
    const stock = STOCK_LABELS[p.stock] ?? p.stock
    const emoji = p.emoji?.trim() ? `${p.emoji.trim()} ` : ''
    const price = isUsableText(p.price) ? p.price.trim() : 'price on request'
    const desc = isUsableText(p.description) ? `\n  Description: ${p.description.trim()}` : ''
    const link = p.checkoutUrl?.trim()
      ? `\n  Checkout link (share this URL with the customer): ${p.checkoutUrl.trim()}`
      : ''
    return `- ${emoji}${p.name.trim()}: ${price} (${stock})${desc}${link}`
  })
  return `CUSTOMER ASKED ABOUT THESE PRODUCTS (prioritize these in your reply):\n${lines.join('\n')}\nInclude the checkout link in your message. Tell the customer to tap the link to view the product and checkout. Be enthusiastic but concise.`
}

export function resolveAiContext(input: ResolveAiContextInput): ResolvedAiContext {
  const customInstructions =
    pickUsableText(
      input.customInstructions,
      input.defaultCustomInstructions,
      GENERAL_AI_INSTRUCTIONS
    ) ?? GENERAL_AI_INSTRUCTIONS

  const notes = pickUsableText(input.notes, input.defaultNotes)

  return { customInstructions, notes }
}

export function antiPlaceholderRule() {
  return ANTI_PLACEHOLDER_RULE
}

const OUTPUT_PLACEHOLDER_PATTERNS: RegExp[] = [
  /\[insert[^\]]*\]/gi,
  /\{insert[^}]*\}/gi,
  /insert\s+(value|text|details?|name|price|info)\s+here/gi,
  /\b\[your\s+\w+\]/gi,
  /\bTBD\b/g,
]

/** Strip common placeholder phrases if the model still emits them. */
export function sanitizeAiOutput(text: string): string {
  let result = text
  for (const pattern of OUTPUT_PLACEHOLDER_PATTERNS) {
    result = result.replace(pattern, '')
  }
  return result.replace(/\s{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
}
