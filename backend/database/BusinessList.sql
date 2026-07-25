-- Job Finder database schema
-- Database engine: SQLite 3
--
-- Usage:
--   sqlite3 jobs.db < schema.sql
--
-- This file creates the database structure only. It does not copy any lead data.

PRAGMA foreign_keys = ON;

BEGIN;

CREATE TABLE IF NOT EXISTS businesses (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    job_type      TEXT NOT NULL,
    business_name TEXT NOT NULL,
    phone         TEXT,
    email         TEXT,
    address       TEXT,
    website       TEXT,
    source_url    TEXT,
    created_at    TEXT DEFAULT CURRENT_TIMESTAMP,
    place_id      TEXT,
    latitude      REAL,
    longitude     REAL,
    category      TEXT,
    opening_hours TEXT,
    rating        REAL,
    review_count  INTEGER,
    updated_at    TEXT,

    UNIQUE (job_type, business_name, phone)
);

-- A Google place ID identifies one business. Empty and NULL values are ignored.
CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_place_id
    ON businesses (place_id)
    WHERE place_id IS NOT NULL AND place_id != '';

-- A populated email address may belong to only one saved business.
CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_email
    ON businesses (email)
    WHERE email IS NOT NULL AND TRIM(email) != '';

-- One current outreach state per lead. Detailed events are kept separately.
CREATE TABLE IF NOT EXISTS lead_outreach (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    business_id           INTEGER NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
    whatsapp_user_id      INTEGER,
    chat_id               TEXT,
    status                TEXT NOT NULL DEFAULT 'selected'
                          CHECK (status IN ('selected', 'messaged', 'responded', 'not_responding',
                                            'qualified', 'converted', 'opted_out', 'failed')),
    auto_reply_enabled    INTEGER NOT NULL DEFAULT 1 CHECK (auto_reply_enabled IN (0, 1)),
    selected_at           TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    first_messaged_at     TEXT,
    last_outbound_at      TEXT,
    last_response_at      TEXT,
    next_follow_up_at     TEXT,
    follow_up_count       INTEGER NOT NULL DEFAULT 0,
    last_error            TEXT,
    created_at            TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lead_outreach_status_due
    ON lead_outreach (status, next_follow_up_at);
CREATE INDEX IF NOT EXISTS idx_lead_outreach_chat_id ON lead_outreach (chat_id);

CREATE TABLE IF NOT EXISTS lead_interactions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    outreach_id     INTEGER NOT NULL REFERENCES lead_outreach(id) ON DELETE CASCADE,
    business_id     INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    direction       TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
    kind            TEXT NOT NULL CHECK (kind IN ('initial', 'reply', 'follow_up', 'system')),
    message_id      TEXT,
    message_text    TEXT,
    sent_at         TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (message_id)
);

CREATE TABLE IF NOT EXISTS business_research (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    business_id     INTEGER NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
    website_url     TEXT NOT NULL,
    page_title      TEXT,
    page_text       TEXT,
    business_summary TEXT,
    researched_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    research_error  TEXT
);

CREATE TABLE IF NOT EXISTS software_recommendations (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    business_id         INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    outreach_id         INTEGER REFERENCES lead_outreach(id) ON DELETE SET NULL,
    title               TEXT NOT NULL,
    problem_statement   TEXT NOT NULL,
    proposed_solution   TEXT NOT NULL,
    business_value      TEXT NOT NULL,
    recommended_platform TEXT NOT NULL CHECK (recommended_platform IN ('web', 'mobile', 'desktop', 'website', 'hybrid')),
    priority            INTEGER NOT NULL DEFAULT 1,
    status              TEXT NOT NULL DEFAULT 'proposed'
                        CHECK (status IN ('proposed', 'presented', 'interested', 'accepted', 'rejected')),
    created_at          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_software_recommendations_business
    ON software_recommendations (business_id, status);

COMMIT;
