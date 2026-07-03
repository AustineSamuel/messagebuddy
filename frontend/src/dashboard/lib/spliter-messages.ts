import type { Message } from "@/dashboard/types";
import type { ApiMessage } from "@/dashboard/lib/whatsapp-mappers";
import { isAudioApiMessage } from "@/dashboard/lib/audio-messages";
import type { SpliterMessage } from "@/whatsappjs-services/contact-summary-types";

export type { SpliterMessage, SyncContactSummaryInput } from "@/whatsappjs-services/contact-summary-types";

const SPLITER_LIMIT = 50;

function messageBody(message: ApiMessage | Message): string {
  if ("direction" in message) {
    const text = message.text?.trim();
    if (text) return text;
    if (message.isAudio) return "[voice message]";
    if (message.hasMedia) return `[${message.messageType || "media"}]`;
    return "";
  }

  if (message.body?.trim()) return message.body.trim();
  if (isAudioApiMessage(message)) return "[voice message]";
  if (message.hasMedia) return `[${message.type || "media"}]`;
  if (message.type) return `[${message.type}]`;
  return "";
}

function reactionText(reactions?: Message["reactions"]): string | null {
  if (!reactions?.length) return null;
  const emojis = reactions.map((r) => r.emoji).filter(Boolean);
  return emojis.length ? emojis.join(" ") : null;
}

function toSpliterRow(
  body: string,
  fromMe: boolean,
  timestamp: number | undefined,
  reaction: string | null
): SpliterMessage {
  const ts = timestamp ?? Math.floor(Date.now() / 1000);
  return {
    message: body,
    sender: fromMe ? "business" : "customer",
    sentAt: new Date(ts * 1000).toISOString(),
    reaction,
  };
}

/** Map WhatsApp API messages (fresh fetch) into spliter objects for AI summary. */
export function apiMessagesToSpliter(messages: ApiMessage[]): SpliterMessage[] {
  const rows: SpliterMessage[] = [];

  for (const item of messages) {
    const body = messageBody(item);
    if (!body) continue;
    rows.push(toSpliterRow(body, Boolean(item.fromMe), item.timestamp, null));
  }

  return rows.slice(-SPLITER_LIMIT);
}

/** Map dashboard messages (incl. reactions from realtime) into spliter objects. */
export function dashboardMessagesToSpliter(messages: Message[]): SpliterMessage[] {
  const rows: SpliterMessage[] = [];

  for (const item of messages) {
    const body = messageBody(item);
    if (!body) continue;
    rows.push(
      toSpliterRow(
        body,
        item.direction === "out",
        item.timestamp,
        reactionText(item.reactions)
      )
    );
  }

  return rows.slice(-SPLITER_LIMIT);
}
