-- ============================================================
-- SpectrumMY LMS — Live Training (Google Meet) Schema
-- Migration 0005
-- Run AFTER 0001_initial_schema.sql
-- ============================================================

-- ─── ENUMS ────────────────────────────────────────────────────────────────

CREATE TYPE live_class_status AS ENUM (
  'draft',
  'scheduled',
  'live',
  'completed',
  'cancelled'
);

CREATE TYPE live_attendance_status AS ENUM (
  'present',
  'late',
  'absent',
  'excused',
  'unknown'
);

CREATE TYPE attendance_source AS ENUM (
  'manual',
  'google',
  'system'
);

CREATE TYPE google_account_status AS ENUM (
  'connected',
  'disconnected',
  'error'
);

CREATE TYPE meet_sync_status AS ENUM (
  'pending',
  'synced',
  'failed',
  'waiting_for_meet'
);

-- ─── TRAINER GOOGLE ACCOUNT MAPPING ───────────────────────────────────────

CREATE TABLE trainer_google_accounts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id          UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  google_email        TEXT NOT NULL,
  google_account_status  google_account_status NOT NULL DEFAULT 'disconnected',
  -- refresh token stored encrypted; never expose to frontend
  google_refresh_token   TEXT,
  google_calendar_id     TEXT,
  last_verified_at       TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (trainer_id)
);

CREATE INDEX idx_trainer_google_trainer ON trainer_google_accounts(trainer_id);
CREATE INDEX idx_trainer_google_email   ON trainer_google_accounts(google_email);

-- ─── LIVE CLASSES ─────────────────────────────────────────────────────────

CREATE TABLE live_classes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- LMS references
  programme_id          UUID REFERENCES programmes(id) ON DELETE RESTRICT,
  module_id             UUID REFERENCES programme_modules(id) ON DELETE SET NULL,
  nadi_id               UUID REFERENCES nadi_sites(id) ON DELETE SET NULL,
  state_id              UUID REFERENCES states(id) ON DELETE SET NULL,
  trainer_id            UUID REFERENCES trainers(id) ON DELETE SET NULL,

  -- Class info
  title                 TEXT NOT NULL,
  description           TEXT,
  scheduled_start       TIMESTAMPTZ NOT NULL,
  scheduled_end         TIMESTAMPTZ NOT NULL,
  timezone              TEXT NOT NULL DEFAULT 'Asia/Kuala_Lumpur',
  max_participants      INTEGER,

  -- Status
  status                live_class_status NOT NULL DEFAULT 'draft',

  -- Google Meet integration (populated when Google is connected)
  video_provider        TEXT NOT NULL DEFAULT 'GOOGLE_MEET',
  google_meet_code      TEXT,
  google_meet_url       TEXT,
  google_event_id       TEXT,
  google_calendar_id    TEXT,

  -- Sync tracking
  meet_sync_status      meet_sync_status NOT NULL DEFAULT 'pending',
  meet_sync_error       TEXT,
  meet_sync_retries     INTEGER NOT NULL DEFAULT 0,
  last_synced_at        TIMESTAMPTZ,

  -- Recording (if enabled by Google Workspace policy)
  recording_available   BOOLEAN NOT NULL DEFAULT FALSE,
  recording_url         TEXT,
  recording_access_policy TEXT,

  -- Audit
  created_by            UUID REFERENCES auth.users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Composite and individual indexes for performance
CREATE INDEX idx_live_classes_programme    ON live_classes(programme_id);
CREATE INDEX idx_live_classes_module       ON live_classes(module_id);
CREATE INDEX idx_live_classes_trainer      ON live_classes(trainer_id);
CREATE INDEX idx_live_classes_nadi         ON live_classes(nadi_id);
CREATE INDEX idx_live_classes_state        ON live_classes(state_id);
CREATE INDEX idx_live_classes_status       ON live_classes(status);
CREATE INDEX idx_live_classes_start        ON live_classes(scheduled_start);
CREATE INDEX idx_live_classes_start_status ON live_classes(scheduled_start, status);
CREATE INDEX idx_live_classes_trainer_start ON live_classes(trainer_id, scheduled_start);

-- ─── LIVE CLASS ATTENDANCE ─────────────────────────────────────────────────

CREATE TABLE live_class_attendance (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  live_class_id       UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
  participant_id      UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,

  -- Join tracking
  join_clicked_at     TIMESTAMPTZ,      -- when participant clicked JOIN in LMS
  first_join_at       TIMESTAMPTZ,      -- from Google Meet data (if available)
  last_seen_at        TIMESTAMPTZ,
  leave_at            TIMESTAMPTZ,
  duration_minutes    DECIMAL(8,2),

  -- Attendance result
  attendance_status   live_attendance_status NOT NULL DEFAULT 'unknown',
  attendance_source   attendance_source NOT NULL DEFAULT 'system',

  -- Manual override
  marked_by           UUID REFERENCES auth.users(id),
  override_reason     TEXT,

  -- Sync metadata
  sync_metadata       JSONB,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Idempotency: one record per participant per class
  UNIQUE (live_class_id, participant_id)
);

CREATE INDEX idx_lca_live_class    ON live_class_attendance(live_class_id);
CREATE INDEX idx_lca_participant   ON live_class_attendance(participant_id);
CREATE INDEX idx_lca_status        ON live_class_attendance(attendance_status);
CREATE INDEX idx_lca_class_part    ON live_class_attendance(live_class_id, participant_id);

-- ─── LIVE CLASS JOIN LOG (separate from attendance; every click is recorded) ──

CREATE TABLE live_class_join_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  live_class_id   UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
  participant_id  UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  clicked_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device_info     TEXT,
  browser_info    TEXT,
  ip_address      TEXT,
  user_agent      TEXT
);

CREATE INDEX idx_join_log_class ON live_class_join_log(live_class_id);
CREATE INDEX idx_join_log_part  ON live_class_join_log(participant_id);

-- ─── UPDATE SYSTEM SETTINGS WITH GOOGLE & ATTENDANCE CONFIG ────────────────

INSERT INTO system_settings (category, setting_key, setting_value, description, is_public)
VALUES
  ('google', 'google_integration_enabled',    'false',               'Enable Google Meet integration',                         false),
  ('google', 'google_workspace_domain',       '',                    'Google Workspace domain (e.g. example.com)',             false),
  ('google', 'google_admin_email',            '',                    'Google admin account email for API operations',          false),
  ('google', 'google_calendar_api_enabled',   'false',               'Google Calendar API connection status',                  false),
  ('google', 'google_meet_api_enabled',       'false',               'Google Meet API connection status',                      false),
  ('google', 'google_last_sync_at',           '',                    'Timestamp of last successful Google sync',               false),
  ('attendance', 'attendance_late_threshold_min',    '15',           'Minutes after class start that marks a join as LATE',    false),
  ('attendance', 'attendance_min_duration_pct',      '70',           'Minimum attendance duration % to count as PRESENT',      false),
  ('attendance', 'attendance_min_duration_min',       '30',          'Minimum minutes attended to count as PRESENT',           false)
ON CONFLICT (setting_key) DO NOTHING;

-- ─── ROW LEVEL SECURITY ────────────────────────────────────────────────────

ALTER TABLE live_classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE live_class_attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE live_class_join_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_google_accounts DISABLE ROW LEVEL SECURITY;

-- NOTE: RLS is disabled for now (consistent with 0003_allow_all.sql pattern).
-- When ready to enable, use policies like:
--
-- CREATE POLICY "participants_view_own_classes" ON live_classes
--   FOR SELECT USING (
--     id IN (
--       SELECT lc.id FROM live_classes lc
--       JOIN participant_programmes pp ON pp.programme_id = lc.programme_id
--       JOIN participants p ON p.id = pp.participant_id
--       WHERE p.id = (SELECT id FROM participants WHERE ... = auth.uid())
--     )
--   );
