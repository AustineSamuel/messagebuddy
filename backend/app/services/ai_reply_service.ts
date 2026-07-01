import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

export type ConversationTurn = {
  role: 'user' | 'assistant'
  content: string
}

export type GenerateReplyInput = {
  incomingMessage: string
  history: ConversationTurn[]
  customInstructions: string | null
  notes: string | null
  contactLabel?: string
}

export type GenerateDraftInput = {
  history: ConversationTurn[]
  customInstructions: string | null
  notes: string | null
  contactLabel?: string
}

const SYSTEM_PROMPT = `You are a helpful business assistant replying on WhatsApp on behalf of the business owner.
Write concise, natural messages suitable for WhatsApp (short paragraphs, friendly but professional).
Do not mention that you are an AI. Do not use markdown. Reply in the same language the customer uses unless instructions say otherwise.`

const DRAFT_SYSTEM_PROMPT = `You are helping a business owner compose their next WhatsApp message.
Write a single suggested reply they will review and send manually.
Be concise and natural for WhatsApp. No markdown. Match the customer's language.
Output only the message text — no quotes, labels, or explanation.`

export default class AiReplyService {
  static isConfigured() {
    return Boolean(env.get('OPENAI_API_KEY'))
  }

  private static buildSystemContent(
    basePrompt: string,
    input: { customInstructions: string | null; notes: string | null; contactLabel?: string }
  ) {
    const systemParts = [basePrompt]
    if (input.customInstructions?.trim()) {
      systemParts.push(`Custom instructions for this chat:\n${input.customInstructions.trim()}`)
    }
    if (input.notes?.trim()) {
      systemParts.push(
        `Internal notes about this contact (use as context, do not quote verbatim):\n${input.notes.trim()}`
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

      return data.choices?.[0]?.message?.content?.trim() || null
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
}
