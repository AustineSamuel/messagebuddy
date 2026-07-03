import {
  antiPlaceholderRule,
  formatBusinessIdentityBlock,
  formatBusinessRulesBlock,
  formatMatchedProductsBlock,
  formatProductCatalogBlock,
  resolveAiContext,
  type BusinessAiContext,
  type ResolveAiContextInput,
} from '#services/ai_context_resolver'
import ProductsService, { type AiProduct } from '../../modules/products/services/products_service.js'

export type ConversationTurn = {
  role: 'user' | 'assistant'
  content: string
}

export type AiPromptInput = ResolveAiContextInput & {
  contactLabel?: string
  business?: BusinessAiContext | null
  incomingMessage?: string
  matchedProducts?: AiProduct[]
}

export type GenerateReplyInput = AiPromptInput & {
  incomingMessage: string
  history: ConversationTurn[]
  matchedProducts?: AiProduct[]
}

export type GenerateDraftInput = AiPromptInput & {
  history: ConversationTurn[]
  matchedProducts?: AiProduct[]
}

export type GenerateFollowUpInput = GenerateDraftInput & {
  interval: 'daily' | 'weekly' | 'every_3_days'
}

export const SYSTEM_PROMPT = `You are a helpful business assistant replying on WhatsApp on behalf of the business described below.
Write concise, natural messages suitable for WhatsApp (short paragraphs, friendly but professional).
Sell effectively using the business profile, catalog, and rules provided. Do not mention that you are an AI. Do not use markdown.
Follow chat-specific rules first when they conflict with global business rules.`

export const DRAFT_SYSTEM_PROMPT = `You are helping a business owner compose their next WhatsApp message.
Write a single suggested reply they will review and send manually.
Be concise and natural for WhatsApp. No markdown. Match the customer's language.
Output only the message text — no quotes, labels, or explanation.`

export const FOLLOW_UP_SYSTEM_PROMPT = `You are a business assistant sending a proactive WhatsApp follow-up on behalf of the owner.
Review the conversation history and write a natural check-in message that continues the relationship — not a duplicate of the last message.
Be warm, brief, and helpful. Reference the conversation context when relevant. No markdown.
Never use placeholders or filler like "insert value here". If details are unknown, keep the message general and friendly.
Output only the message text.`

export function buildSystemContent(basePrompt: string, input: AiPromptInput) {
  const resolved = resolveAiContext(input)
  const systemParts = [basePrompt, antiPlaceholderRule()]

  if (input.business) {
    const identity = formatBusinessIdentityBlock(input.business)
    if (identity) systemParts.push(identity)

    const businessRules = formatBusinessRulesBlock(input.business)
    if (businessRules) systemParts.push(businessRules)

    const catalog = formatProductCatalogBlock(input.business)
    if (catalog) systemParts.push(catalog)

    if (input.incomingMessage && input.business.products.length) {
      const matched =
        input.matchedProducts ??
        ProductsService.searchForMessage(
          input.incomingMessage,
          input.business.products.map((p) => ({
            name: p.name,
            slug: p.slug ?? '',
            description: p.description ?? null,
            price: p.price,
            stock: p.stock,
            emoji: p.emoji,
            checkoutUrl: p.checkoutUrl ?? '',
          }))
        )
      const matchedBlock = formatMatchedProductsBlock(
        matched.map((p) => ({
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          stock: p.stock,
          emoji: p.emoji,
          checkoutUrl: p.checkoutUrl,
        }))
      )
      if (matchedBlock) systemParts.push(matchedBlock)
    }
  }

  systemParts.push(
    `PRIMARY RULES FOR THIS CHAT (highest priority — follow these over global business rules when they conflict):\n${resolved.customInstructions}`
  )

  if (resolved.notes) {
    systemParts.push(
      `Internal notes about this contact (use as context, do not quote verbatim):\n${resolved.notes}`
    )
  }

  if (input.contactLabel) {
    systemParts.push(`You are replying in a chat with: ${input.contactLabel}`)
  }

  return systemParts.join('\n\n')
}
