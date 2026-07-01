# AI Auto-Reply (Backend)

MessageBuddy can reply to incoming WhatsApp messages **on the server**, even when the user closes their browser. This uses `whatsapp-web.js` on the backend plus OpenAI-compatible chat completions.

## Overview

```
Customer message → wwebjs `message` event → load saved chat rules → AI (30-msg context) → msg.reply()
```

The frontend is **not** involved in auto-reply. The WhatsApp session runs in Node.js (Puppeteer + Chrome) and stays active as long as the backend process is running.

## Requirements

### 1. WhatsApp session must be `ready`

The listener is attached when the client emits `ready` (or when the ready-fallback promotes a connected session). Until then, no auto-replies are sent.

### 2. Per-chat rules must exist in the database

Auto-reply **only** runs when there is a **saved row** in `chat_rules` for that `chat_id` (not the `__default__` row).

| Condition | Behavior |
|-----------|----------|
| No row for this chat | **No reply** |
| `ai_auto_reply = false` | No reply |
| `rule = never` | No reply |
| Row exists + `ai_auto_reply = true` + rule ≠ `never` | AI may reply |

Saving rules from the dashboard **Right panel → Save contact rules** creates/updates the per-chat row.

The global **Default chat rules** in Settings apply to the UI fallback only; they do **not** trigger auto-reply for chats without their own saved row.

### 3. OpenAI API key

Set in backend `.env`:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
# Optional — use another OpenAI-compatible provider:
# OPENAI_BASE_URL=https://api.openai.com/v1
```

If `OPENAI_API_KEY` is missing, messages are still received but no AI reply is generated (a warning is logged).

## How it works

### Message listener

File: `backend/modules/whatsapp/services/whatsapp_client_manager.ts`

On `ready`, `attachAutoReplyListener()` registers:

```ts
client.on('message', (message) => { ... })
```

### Handler

File: `backend/modules/whatsapp/services/whatsapp_auto_reply_service.ts`

For each incoming message:

1. **Skip** if `fromMe`, status/broadcast, or empty body (non-text without media label).
2. **Deduplicate** by message id (in-memory, 1 hour TTL).
3. **Serialize** chat id (`1234567890@c.us` or group id).
4. **Load rules** via `ChatRulesService.getSavedRuleForChat(userId, chatId)` — no fallback to default.
5. **Fetch history** — `chat.fetchMessages({ limit: 30 })`, chronological, mapped to user/assistant turns.
6. **Call AI** — `AiReplyService.generateReply()` with history + `custom_instructions` + `notes`.
7. **Send** — `message.reply(replyText)` via wwebjs.

One auto-reply at a time per `userId + chatId` (in-flight lock).

### AI service

File: `backend/app/services/ai_reply_service.ts`

- Uses OpenAI Chat Completions API (`/v1/chat/completions`).
- System prompt: professional WhatsApp business assistant.
- Injects per-chat `custom_instructions` and `notes` from `chat_rules`.
- Last user turn is the new incoming message; prior turns come from the 30-message window.

### Chat rules lookup

File: `backend/modules/chat_rules/services/chat_rules_service.ts`

- `getSavedRuleForChat()` — returns a row only if `chat_id` matches exactly; never merges `__default__`.

## Database

Table: `chat_rules`

| Column | Used for auto-reply |
|--------|---------------------|
| `user_id` | Owner of the WhatsApp session |
| `chat_id` | WhatsApp chat id (must match wwebjs) |
| `rule` | `never` blocks reply |
| `ai_auto_reply` | Master toggle per chat |
| `custom_instructions` | AI system context |
| `notes` | Extra context for AI |
| `send_catalog` | Reserved (not wired yet) |
| `notify_on_reply` | Reserved (not wired yet) |

## Operating offline (user closed browser)

- Closing the **browser tab** does not stop the backend WhatsApp client.
- Auto-reply continues while:
  - The AdonisJS server is running
  - The wwebjs session stays `ready`
  - Chrome/Puppeteer for that user is healthy

Restart the server → sessions restore from `storage/whatsapp_auth/` via `restoreIfPersisted`.

## Limitations

- **Unofficial API** — `whatsapp-web.js` is not Meta’s Business API; use at your own risk.
- **No default-row replies** — chats without saved rules are ignored by design.
- **In-memory dedup** — restarts may rarely double-reply if the same message is re-delivered.
- **Groups** — replies in groups if a rule row exists for the group `chat_id`; all group messages in that chat share one rule row.

## Files

| File | Role |
|------|------|
| `modules/whatsapp/services/whatsapp_client_manager.ts` | Attaches listener on `ready` |
| `modules/whatsapp/services/whatsapp_auto_reply_service.ts` | Message handler + rules + history |
| `app/services/ai_reply_service.ts` | OpenAI API client |
| `modules/chat_rules/services/chat_rules_service.ts` | `getSavedRuleForChat()` |
| `start/env.ts` | `OPENAI_*` env vars |

## Testing locally

1. Set `OPENAI_API_KEY` in backend `.env`.
2. Start backend: `npm run dev` in `backend/`.
3. Connect WhatsApp in the dashboard until status is `ready`.
4. Open a chat in the right panel, configure rules, click **Save contact rules**.
5. From another phone, send a message to that chat.
6. Check backend logs for `AI auto-reply sent`.

## Compose assist (Generate AI button)

The chat input has an **✨ AI** button that drafts a reply without sending it.

### API

```
POST /api/v1/whatsapp/chats/:chatId/ai-suggest-reply?limit=50
```

Returns `{ suggestion: string, messageCount: number }`.

### Behavior

1. Fetches up to **50** recent messages from WhatsApp (query `limit`, max 100).
2. Loads chat rules via `ChatRulesService.getForChat()` (per-chat row or **default** fallback).
3. Calls `AiReplyService.generateDraftReply()` — same OpenAI setup as auto-reply.
4. Frontend inserts `suggestion` into the message input; user reviews and clicks Send.

Unlike server auto-reply, compose assist **does** use default rules when no per-chat row exists. Chats with `rule = never` return an error.

### Files

| File | Role |
|------|------|
| `modules/whatsapp/services/whatsapp_service.ts` | `suggestAiReply()` |
| `app/services/ai_reply_service.ts` | `generateDraftReply()` |
| `modules/whatsapp/helpers/conversation_history.ts` | Shared history builder |
| `frontend/src/whatsappjs-services/chats.ts` | `suggestAiReply()` client |
| `frontend/src/dashboard/components/chat/ChatArea.tsx` | ✨ AI button |

### AI context resolution

File: `app/services/ai_context_resolver.ts`

Before calling OpenAI, instructions and notes are resolved in this order:

1. Per-chat saved value (if not empty and not a placeholder)
2. Default chat rules row (`__default__`)
3. Built-in general business instructions

Placeholder-like text is ignored (e.g. `insert value here`, `TBD`, `lorem ipsum`, UI filler).

The system prompt explicitly forbids placeholders in output. `sanitizeAiOutput()` strips any that slip through.

## Future improvements

- Persist processed message ids in Redis/DB
- Wire `send_catalog` to product catalog in settings
- Wire `notify_on_reply` to email/push
- Queue + retry for AI failures
- Official WhatsApp Cloud API for production scale
