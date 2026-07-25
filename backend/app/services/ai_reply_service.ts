import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { sanitizeAiOutput } from '#services/ai_context_resolver'
import {
  buildSystemContent,
  CONTACT_SUMMARY_SYSTEM_PROMPT,
  DRAFT_SYSTEM_PROMPT,
  FOLLOW_UP_SYSTEM_PROMPT,
  SYSTEM_PROMPT,
  type GenerateContactSummaryInput,
  type GenerateDraftInput,
  type GenerateFollowUpInput,
  type GenerateReplyInput,
  type GenerateLeadStrategyInput,
  type LeadStrategy,
} from '#services/ai_reply_shared'

export type {
  ConversationTurn,
  GenerateDraftInput,
  GenerateFollowUpInput,
  GenerateReplyInput,
} from '#services/ai_reply_shared'

export default class AiReplyService {
  static isConfigured() {
    return Boolean(env.get('OPENAI_API_KEY'))
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
          'Authorization': `Bearer ${apiKey}`,
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
      {
        role: 'system',
        content: buildSystemContent(SYSTEM_PROMPT, {
          ...input,
          incomingMessage: input.incomingMessage,
        }),
      },
      ...input.history.map((turn) => ({ role: turn.role, content: turn.content })),
      { role: 'user', content: input.incomingMessage },
    ]

    return this.completeChat(messages)
  }

  static async generateDraftReply(input: GenerateDraftInput): Promise<string | null> {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: buildSystemContent(DRAFT_SYSTEM_PROMPT, {
          ...input,
          incomingMessage: input.incomingMessage,
          matchedProducts: input.matchedProducts,
        }),
      },
      ...input.history.map((turn) => ({ role: turn.role, content: turn.content })),
      {
        role: 'user',
        content:
          'Based on the conversation above, write the next message I (the business) should send. Reply to the customer appropriately.',
      },
    ]

    return this.completeChat(messages)
  }

  static async generateContactSummary(input: GenerateContactSummaryInput): Promise<string | null> {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: CONTACT_SUMMARY_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Contact: ${input.contactLabel}\n\nConversation:\n${JSON.stringify(input.spliter, null, 2)}`,
      },
    ]

    return this.completeChat(messages)
  }

  static async generateFollowUpMessage(input: GenerateFollowUpInput): Promise<string | null> {
    const intervalLabel =
      input.interval === 'daily' ? 'daily' : input.interval === 'weekly' ? 'weekly' : 'every 3 days'

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: buildSystemContent(FOLLOW_UP_SYSTEM_PROMPT, input) },
      ...input.history.map((turn) => ({ role: turn.role, content: turn.content })),
      {
        role: 'user',
        content: `Write a ${intervalLabel} follow-up message to re-engage this customer based on the conversation above. Do not repeat the last message verbatim.`,
      },
    ]

    return this.completeChat(messages)
  }

  static async generateLeadStrategy(
    input: GenerateLeadStrategyInput
  ): Promise<LeadStrategy | null> {
    const raw = await this.completeChat([
      {
        role: 'system',
        content:
          'You are a senior software consultant. Analyze only the evidence supplied. Identify one high-value, realistic problem and propose a focused product we could build. Return strict JSON with keys summary, title, problem, solution, value, platform. platform must be web, mobile, desktop, website, or hybrid. Do not use markdown.',
      },
      { role: 'user', content: JSON.stringify(input) },
    ])
    return parseLeadStrategy(raw)
  }
}

function parseLeadStrategy(raw: string | null): LeadStrategy | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw.replace(/^```json\s*|```$/g, '').trim()) as LeadStrategy
    const platforms = ['web', 'mobile', 'desktop', 'website', 'hybrid']
    if (
      !value.summary ||
      !value.title ||
      !value.problem ||
      !value.solution ||
      !value.value ||
      !platforms.includes(value.platform)
    )
      return null
    return value
  } catch {
    return null
  }
}
