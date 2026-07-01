# Credits & Analytics

MessageBuddy meters WhatsApp activity with a **credits ledger** and records **analytics** for the dashboard.

## Credits model

| Constant | Value |
|----------|-------|
| Signup bonus | **5,000** credits |
| Cost per outbound message | **0.5** credits |
| Purchase rate | **100 credits = ₦1,000** |

Credits are stored on `users.credits_balance`. Every change is appended to `credit_transactions` for audit.

### Charging

Credits are deducted when a message is **successfully sent**:

- Manual send — `POST /api/v1/whatsapp/chats/:chatId/messages`
- AI auto-reply — `WhatsAppAutoReplyService`
- AI follow-up — `FollowUpService`

If balance &lt; 0.5, manual sends return **402** with `{ error, balance, required }`. AI paths skip silently or defer follow-ups.

### Purchase (MVP)

`POST /api/v1/credits/purchase` with `{ "credits": 100 }` (multiples of 100).

Payment gateway integration (Paystack / Flutterwave) is **not** wired yet — credits are granted immediately for development.

## Database tables

### `users.credits_balance`
Decimal balance, default `5000` for new rows.

### `credit_transactions`
Ledger: `amount` (signed), `balance_after`, `type` (`signup_bonus` | `purchase` | `message_sent`), optional `chat_id`.

### `credit_usage_daily`
Per-user daily rollup: `credits_used`, `messages_sent` — powers the analytics bar chart.

### `message_logs`
One row per charged message: `source`, `body_preview`, `is_ai`, `chat_label` — powers recent activity, hourly volume, top contacts.

## API

### Credits
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/credits` | Balance, rates, today's usage, packages |
| GET | `/api/v1/credits/usage?days=7` | Daily usage for charts |
| POST | `/api/v1/credits/purchase` | Buy credits `{ credits: number }` |

### Analytics
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/analytics/summary?period=7d` | KPIs (`today` \| `7d` \| `30d`) |
| GET | `/api/v1/analytics/hourly` | 24-hour message counts (today) |
| GET | `/api/v1/analytics/top-contacts?period=7d` | Most messaged chats |
| GET | `/api/v1/analytics/recent-messages` | Latest outbound messages |

## Registration

`NewAccountController` and `FirebaseAuthsController` call `CreditsService.initializeNewUser()` to record the signup bonus transaction. Balance comes from the DB default.

## Code map

```
backend/config/credits.ts              — constants & packages
backend/modules/credits/                 — balance, purchase, charging
backend/modules/analytics/             — dashboard aggregations
backend/app/services/credits_service.ts — barrel export
```

## Migration

```bash
cd backend && npm run migrate
```

Creates tables and adds `users.credits_balance`.
