import env from '#start/env'
import AiReplyService from '#services/ai_reply_service'
import NvidiaAiReplyService from '#services/nvidia_ai_reply_service'
import type {
  GenerateContactSummaryInput,
  GenerateDraftInput,
  GenerateFollowUpInput,
  GenerateReplyInput,
  GenerateLeadStrategyInput,
  LeadStrategy,
} from '#services/ai_reply_shared'

export type {
  ConversationTurn,
  GenerateContactSummaryInput,
  GenerateDraftInput,
  GenerateFollowUpInput,
  GenerateReplyInput,
  SpliterMessage,
} from '#services/ai_reply_shared'

type ReplyServiceContract = {
  isConfigured(): boolean
  generateReply(input: GenerateReplyInput): Promise<string | null>
  generateDraftReply(input: GenerateDraftInput): Promise<string | null>
  generateFollowUpMessage(input: GenerateFollowUpInput): Promise<string | null>
  generateContactSummary(input: GenerateContactSummaryInput): Promise<string | null>
  generateLeadStrategy(input: GenerateLeadStrategyInput): Promise<LeadStrategy | null>
}

function activeService(): ReplyServiceContract {
  const provider = (env.get('AI_REPLY_PROVIDER') ?? 'openai').toLowerCase()
  return provider === 'nvidia' ? NvidiaAiReplyService : AiReplyService
}

/** Routes AI reply calls to OpenAI or NVIDIA based on AI_REPLY_PROVIDER. */
export default class AiReplyProvider {
  static isConfigured() {
    return activeService().isConfigured()
  }

  static generateReply(input: GenerateReplyInput) {
    return activeService().generateReply(input)
  }

  static generateDraftReply(input: GenerateDraftInput) {
    return activeService().generateDraftReply(input)
  }

  static generateFollowUpMessage(input: GenerateFollowUpInput) {
    return activeService().generateFollowUpMessage(input)
  }

  static generateContactSummary(input: GenerateContactSummaryInput) {
    return activeService().generateContactSummary(input)
  }

  static generateLeadStrategy(input: GenerateLeadStrategyInput) {
    return activeService().generateLeadStrategy(input)
  }
}
