import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import {
  antiPlaceholderRule,
  formatBusinessIdentityBlock,
  formatBusinessRulesBlock,
  formatProductCatalogBlock,
  resolveAiContext,
  sanitizeAiOutput,
  type BusinessAiContext,
  type ResolveAiContextInput,
} from '#services/ai_context_resolver'

export type ConversationTurn = {
  role: 'user' | 'assistant'
  content: string
}

type AiPromptInput = ResolveAiContextInput & {
  contactLabel?: string
  business?: BusinessAiContext | null
}

export type GenerateReplyInput = AiPromptInput & {
  incomingMessage: string
  history: ConversationTurn[]
}

export type GenerateDraftInput = AiPromptInput & {
  history: ConversationTurn[]
}

export type GenerateFollowUpInput = GenerateDraftInput & {
  interval: 'daily' | 'weekly' | 'every_3_days'
}

const SYSTEM_PROMPT = `You are a helpful business assistant replying on WhatsApp on behalf of the business described below.
Write concise, natural messages suitable for WhatsApp (short paragraphs, friendly but professional).
Sell effectively using the business profile, catalog, and rules provided. Do not mention that you are an AI. Do not use markdown.
Follow chat-specific rules first when they conflict with global business rules.`

const DRAFT_SYSTEM_PROMPT = `You are helping a business owner compose their next WhatsApp message.
Write a single suggested reply they will review and send manually.
Be concise and natural for WhatsApp. No markdown. Match the customer's language.
Output only the message text — no quotes, labels, or explanation.`

const FOLLOW_UP_SYSTEM_PROMPT = `You are a business assistant sending a proactive WhatsApp follow-up on behalf of the owner.
Review the conversation history and write a natural check-in message that continues the relationship — not a duplicate of the last message.
Be warm, brief, and helpful. Reference the conversation context when relevant. No markdown.
Never use placeholders or filler like "insert value here". If details are unknown, keep the message general and friendly.
Output only the message text.`

export default class AiReplyService {
  static isConfigured() {
    return Boolean(env.get('OPENAI_API_KEY'))
  }

  private static buildSystemContent(basePrompt: string, input: AiPromptInput) {
    const resolved = resolveAiContext(input)
    const systemParts = [basePrompt, antiPlaceholderRule()]

    if (input.business) {
      const identity = formatBusinessIdentityBlock(input.business)
      if (identity) systemParts.push(identity)

      const businessRules = formatBusinessRulesBlock(input.business)
      if (businessRules) systemParts.push(businessRules)

      const catalog = formatProductCatalogBlock(input.business)
      if (catalog) systemParts.push(catalog)
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

  private static async completeChat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  ): Promise<string | null> {
    const apiKey = env.get('OPENAI_API_KEY')
    if (!apiKey) {
      logger.warn('OPENAI_API_KEY is not set — AI request skipped')
      return null
    }

    const model = env.get('OPENAI_MODEL') ?? 'gpt-4o-mini'
    const baseUrl = (env.get('OPENAI_BASE_URL') ?? 'https://api.openai.com/v1').replace(/\/$/, '')

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      })

      if (!response.ok) {
        const body = await response.text()
        logger.error({ status: response.status, body }, 'AI API request failed')
        return null
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>
      }

      return sanitizeAiOutput(data.choices?.[0]?.message?.content?.trim() || '') || null
    } catch (error) {
      logger.error({ err: error }, 'AI request error')
      return null
    }
  }

  static async generateReply(input: GenerateReplyInput): Promise<string | null> {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: this.buildSystemContent(SYSTEM_PROMPT, input) },
      ...input.history.map((turn) => ({ role: turn.role, content: turn.content })),
      { role: 'user', content: input.incomingMessage },
    ]

    return this.completeChat(messages)
  }

  static async generateDraftReply(input: GenerateDraftInput): Promise<string | null> {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: this.buildSystemContent(DRAFT_SYSTEM_PROMPT, input) },
      ...input.history.map((turn) => ({ role: turn.role, content: turn.content })),
      {
        role: 'user',
        content:
          'Based on the conversation above, write the next message I (the business) should send. Reply to the customer appropriately.',
      },
    ]

    return this.completeChat(messages)
  }

  static async generateFollowUpMessage(input: GenerateFollowUpInput): Promise<string | null> {
    const intervalLabel =
      input.interval === 'daily'
        ? 'daily'
        : input.interval === 'weekly'
          ? 'weekly'
          : 'every 3 days'

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: this.buildSystemContent(FOLLOW_UP_SYSTEM_PROMPT, input) },
      ...input.history.map((turn) => ({ role: turn.role, content: turn.content })),
      {
        role: 'user',
        content: `Write a ${intervalLabel} follow-up message to re-engage this customer based on the conversation above. Do not repeat the last message verbatim.`,
      },
    ]

    return this.completeChat(messages)
  }
}
