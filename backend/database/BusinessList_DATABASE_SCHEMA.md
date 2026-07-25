# Job Finder Database Schema

This document describes the database shared by the Python and Node.js scrapers.
The project uses **SQLite 3** and stores lead data in `BusinessList.db`. In
addition to imported businesses, it records outbound outreach, replies,
website research, and software recommendations.

For a clean copy of the structure, use the accompanying [`schema.sql`](schema.sql)
file. It creates tables and indexes only; it does not contain or export lead data.

## Quick start

Create a new database for another project:

```bash
sqlite3 new-jobs.db < schema.sql
```

Inspect the result:

```bash
sqlite3 new-jobs.db ".schema businesses"
```

Applications should enable foreign-key enforcement whenever they open a
connection, even though the current schema has no foreign keys:

```sql
PRAGMA foreign_keys = ON;
```

## Entity overview

```text
businesses
├── lead_outreach (one current campaign state per business)
│   └── lead_interactions (initial, inbound, and follow-up messages)
├── business_research (one website snapshot and summary)
└── software_recommendations (versioned product ideas)
```

## Table: `businesses`

One row represents one business lead collected from a Google Maps / Business
Profile listing.

| Column          | SQLite type | Required | Default             | Description                                                                         |
| --------------- | ----------- | -------: | ------------------- | ----------------------------------------------------------------------------------- |
| `id`            | `INTEGER`   |      Yes | Auto-generated      | Surrogate primary key. Uses SQLite `AUTOINCREMENT`.                                 |
| `job_type`      | `TEXT`      |      Yes | —                   | Search term or business type used to find the listing.                              |
| `business_name` | `TEXT`      |      Yes | —                   | Business display name.                                                              |
| `phone`         | `TEXT`      |       No | `NULL`              | Phone number as collected; stored as text to preserve formatting and country codes. |
| `email`         | `TEXT`      |       No | `NULL`              | Business email address. The Node scraper normalizes new values to lowercase.        |
| `address`       | `TEXT`      |       No | `NULL`              | Formatted street or locality address.                                               |
| `website`       | `TEXT`      |       No | `NULL`              | Business website URL.                                                               |
| `source_url`    | `TEXT`      |       No | `NULL`              | Google Maps or source listing URL.                                                  |
| `created_at`    | `TEXT`      |       No | `CURRENT_TIMESTAMP` | Creation time in SQLite's UTC `YYYY-MM-DD HH:MM:SS` format when omitted.            |
| `place_id`      | `TEXT`      |       No | `NULL`              | Google Maps place identifier.                                                       |
| `latitude`      | `REAL`      |       No | `NULL`              | Latitude in decimal degrees.                                                        |
| `longitude`     | `REAL`      |       No | `NULL`              | Longitude in decimal degrees.                                                       |
| `category`      | `TEXT`      |       No | `NULL`              | Category reported by the listing or scraper.                                        |
| `opening_hours` | `TEXT`      |       No | `NULL`              | Opening-hours value in the scraper's serialized text format.                        |
| `rating`        | `REAL`      |       No | `NULL`              | Google rating value.                                                                |
| `review_count`  | `INTEGER`   |       No | `NULL`              | Number of reviews at collection time.                                               |
| `updated_at`    | `TEXT`      |       No | `NULL`              | Last scraper update time. The Node scraper writes an ISO 8601 timestamp.            |

SQLite uses dynamic typing, so the declared types express the intended storage
classes rather than strict length limits.

## Keys, constraints, and indexes

| Name                      | Kind                 | Columns / expression             | Purpose                                                                 |
| ------------------------- | -------------------- | -------------------------------- | ----------------------------------------------------------------------- |
| `businesses.id`           | Primary key          | `id`                             | Uniquely identifies each row.                                           |
| SQLite auto-index         | Unique constraint    | `job_type, business_name, phone` | Prevents an identical lead identity from being inserted more than once. |
| `idx_businesses_place_id` | Partial unique index | `place_id`                       | Allows only one row per populated, non-empty Google place ID.           |
| `idx_businesses_email`    | Partial unique index | `email`                          | Allows only one row per populated, non-blank email value.               |

Important SQLite behavior:

- A `UNIQUE` constraint permits multiple `NULL` values.
- The composite uniqueness rule also permits apparently similar rows when
  `phone` is `NULL`, because `NULL` values are not considered equal.
- The email index uses SQLite's default binary collation. The Node scraper
  lowercases new emails before saving them, but other writers should also
  normalize emails with `LOWER(TRIM(email))` for consistent deduplication.
- Outreach child records use foreign keys back to `businesses`.

## Outreach tables

### `lead_outreach`

Stores the current sales state for a business. Status is one of `selected`,
`messaged`, `responded`, `not_responding`, `qualified`, `converted`,
`opted_out`, or `failed`. It also stores the WhatsApp chat, automatic-reply
flag, response timestamps, follow-up count, and next due time.

### `lead_interactions`

Provides the immutable activity history. Every row is inbound or outbound and
is classified as an initial message, reply, follow-up, or system event.

### `business_research`

Stores a bounded website text snapshot, page title, AI-written business
summary, research time, and any research error. There is at most one current
research row per business.

### `software_recommendations`

Stores a specific business problem, proposed solution, expected business
value, platform (`web`, `mobile`, `desktop`, `website`, or `hybrid`), priority,
and sales status. Recommendations always reference the originating business.

## Automated lead pipeline

The backend scheduler selects at most 100 new businesses per UTC day. A lead
must have a phone number and `review_count > 0`. Already-selected businesses
are excluded. Successfully messaged chats receive an `always` AI reply rule and
an every-three-days follow-up schedule.

Automatic sending is disabled unless both of these environment values are set:

```env
LEAD_OUTREACH_ENABLED=true
LEAD_OUTREACH_USER_ID=1
```

Optional controls:

```env
LEAD_OUTREACH_DAILY_LIMIT=100
LEAD_RESEARCH_RESPONSE_RATE=0.25
BUSINESS_LIST_DB_PATH=/absolute/path/to/BusinessList.db
```

`LEAD_OUTREACH_USER_ID` must be the MessageBuddy user whose WhatsApp session is
already linked. Keep `LEAD_OUTREACH_ENABLED` off while reviewing the audience
and message. WhatsApp opt-outs and applicable anti-spam/privacy rules must be
honored.

## Typical queries

Get the newest leads:

```sql
SELECT id, business_name, phone, email, website, created_at
FROM businesses
ORDER BY id DESC
LIMIT 50;
```

See daily campaign state:

```sql
SELECT b.id, b.business_name, o.status, o.first_messaged_at,
       o.last_response_at, o.next_follow_up_at
FROM lead_outreach o
JOIN businesses b ON b.id = o.business_id
ORDER BY o.updated_at DESC;
```

List businesses that have not responded:

```sql
SELECT b.id, b.business_name, b.phone, o.last_outbound_at
FROM lead_outreach o
JOIN businesses b ON b.id = o.business_id
WHERE o.status IN ('messaged', 'not_responding')
  AND o.last_response_at IS NULL;
```

Find leads by category:

```sql
SELECT business_name, phone, email, address
FROM businesses
WHERE job_type = 'restaurant'
   OR category = 'restaurant'
ORDER BY business_name;
```

Count leads by business type:

```sql
SELECT job_type, COUNT(*) AS lead_count
FROM businesses
GROUP BY job_type
ORDER BY lead_count DESC;
```

## Sharing data as well as structure

`schema.sql` intentionally contains no business records. To transfer the full
database, copy `jobs.db`. To produce a portable SQL dump containing both the
schema and records, run:

```bash
sqlite3 jobs.db ".dump" > jobs-full-dump.sql
```

Restore that dump into a new database:

```bash
sqlite3 restored-jobs.db < jobs-full-dump.sql
```

Lead data may contain contact information. Review and protect a data dump before
sharing it outside the project.
