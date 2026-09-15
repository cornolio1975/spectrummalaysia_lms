-- ============================================================
-- SpectrumMY Programme & Learning Management System
-- Migration 0001: Initial Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full-text search

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE programme_status    AS ENUM ('draft','published','active','completed','archived');
CREATE TYPE event_status        AS ENUM ('draft','scheduled','registration_open','registration_closed','in_progress','completed','cancelled');
CREATE TYPE session_status      AS ENUM ('draft','scheduled','in_progress','completed','cancelled');
CREATE TYPE participant_status  AS ENUM ('active','inactive','deactivated','blacklisted');
CREATE TYPE gender_type         AS ENUM ('male','female','other','prefer_not_to_say');
CREATE TYPE content_type        AS ENUM ('video','pdf','powerpoint','word','image','audio','text','external','activity','quiz','assessment');
CREATE TYPE attendance_status   AS ENUM ('present','late','absent','excused');
CREATE TYPE certificate_status  AS ENUM ('pending','issued','revoked');
CREATE TYPE user_role           AS ENUM ('super_admin','programme_admin','nadi_admin','state_admin','trainer','registrar','observer');
CREATE TYPE media_category      AS ENUM ('learning_video','recorded_session','participant_photo','event_photo','programme_media','document','other');
CREATE TYPE kpi_period          AS ENUM ('monthly','quarterly','yearly');
CREATE TYPE quiz_question_type  AS ENUM ('multiple_choice','multiple_select','true_false','short_answer','matching');
CREATE TYPE audit_action        AS ENUM (
  'login','logout',
  'participant_create','participant_edit','participant_delete',
  'programme_create','programme_edit',
  'module_create','module_edit',
  'lesson_create','lesson_edit',
  'event_create','event_edit',
  'attendance_record','attendance_edit',
  'assessment_create','assessment_grade',
  'certificate_issue','certificate_revoke',
  'media_upload','media_delete',
  'report_export',
  'settings_change','role_change','permission_change'
);

-- ============================================================
-- STATES
-- ============================================================

CREATE TABLE states (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code   TEXT NOT NULL UNIQUE,
  state_name   TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'active',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_states_code ON states(state_code);

-- ============================================================
-- NADI SITES
-- ============================================================

CREATE TABLE nadi_sites (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nadi_code        TEXT NOT NULL UNIQUE,
  nadi_name        TEXT NOT NULL,
  state_id         UUID NOT NULL REFERENCES states(id) ON DELETE RESTRICT,
  address          TEXT,
  district         TEXT,
  postcode         TEXT,
  latitude         DECIMAL(10,7),
  longitude        DECIMAL(10,7),
  contact_person   TEXT,
  contact_phone    TEXT,
  contact_email    TEXT,
  status           TEXT NOT NULL DEFAULT 'active',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nadi_state ON nadi_sites(state_id);
CREATE INDEX idx_nadi_code  ON nadi_sites(nadi_code);
CREATE INDEX idx_nadi_status ON nadi_sites(status);

-- ============================================================
-- USER PROFILES (extends Supabase auth.users)
-- ============================================================

CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT,
  phone        TEXT,
  role         user_role NOT NULL DEFAULT 'observer',
  state_id     UUID REFERENCES states(id),
  nadi_id      UUID REFERENCES nadi_sites(id),
  avatar_url   TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  last_login   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role  ON profiles(role);
CREATE INDEX idx_profiles_state ON profiles(state_id);
CREATE INDEX idx_profiles_nadi  ON profiles(nadi_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TRAINERS
-- ============================================================

CREATE TABLE trainers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  email            TEXT UNIQUE,
  phone            TEXT,
  specialization   TEXT,
  organization     TEXT,
  profile_photo    TEXT,
  status           TEXT NOT NULL DEFAULT 'active',
  created_by       UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trainers_status ON trainers(status);

-- ============================================================
-- PROGRAMMES
-- ============================================================

CREATE TABLE programmes (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_code                TEXT NOT NULL UNIQUE,
  programme_name                TEXT NOT NULL,
  description                   TEXT,
  category                      TEXT,
  target_age_group              TEXT,                    -- e.g. "13-17, 18-24"
  target_gender                 TEXT,                    -- e.g. "all", "female"
  start_date                    DATE,
  end_date                      DATE,
  status                        programme_status NOT NULL DEFAULT 'draft',
  thumbnail                     TEXT,
  certificate_enabled           BOOLEAN NOT NULL DEFAULT TRUE,
  completion_percentage_required DECIMAL(5,2) NOT NULL DEFAULT 80.00,
  created_by                    UUID REFERENCES auth.users(id),
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at                    TIMESTAMPTZ
);

CREATE INDEX idx_programmes_status  ON programmes(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_programmes_code    ON programmes(programme_code);

-- ============================================================
-- PROGRAMME MODULES
-- ============================================================

CREATE TABLE programme_modules (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id   UUID NOT NULL REFERENCES programmes(id) ON DELETE CASCADE,
  module_code    TEXT,
  title          TEXT NOT NULL,
  description    TEXT,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'published',
  created_by     UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_modules_programme ON programme_modules(programme_id);
CREATE INDEX idx_modules_order     ON programme_modules(programme_id, sort_order);

-- ============================================================
-- LESSONS / TOPICS
-- ============================================================

CREATE TABLE lessons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id    UUID NOT NULL REFERENCES programme_modules(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  duration_min INTEGER,                   -- estimated duration in minutes
  is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
  status       TEXT NOT NULL DEFAULT 'published',
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lessons_module ON lessons(module_id);
CREATE INDEX idx_lessons_order  ON lessons(module_id, sort_order);

-- ============================================================
-- LESSON CONTENT BLOCKS
-- ============================================================

CREATE TABLE lesson_contents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id    UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  content_type content_type NOT NULL,
  title        TEXT,
  description  TEXT,
  file_url     TEXT,                      -- Supabase Storage URL / signed URL
  file_name    TEXT,
  file_size    BIGINT,
  duration_sec INTEGER,                   -- for video/audio
  external_url TEXT,                      -- for external links
  content_body TEXT,                      -- for text content
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_required  BOOLEAN NOT NULL DEFAULT FALSE,
  status       TEXT NOT NULL DEFAULT 'published',
  metadata     JSONB,                     -- flexible metadata per content type
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_lesson      ON lesson_contents(lesson_id);
CREATE INDEX idx_content_type        ON lesson_contents(content_type);
CREATE INDEX idx_content_order       ON lesson_contents(lesson_id, sort_order);

-- ============================================================
-- PARTICIPANTS
-- ============================================================

CREATE TABLE participants (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_code    TEXT UNIQUE,               -- auto-generated
  full_name           TEXT NOT NULL,
  ic_number           TEXT,                      -- MyKad / passport
  gender              gender_type,
  date_of_birth       DATE,
  phone               TEXT,
  email               TEXT,
  address             TEXT,
  postcode            TEXT,
  state_id            UUID REFERENCES states(id),
  nadi_id             UUID REFERENCES nadi_sites(id),
  organization        TEXT,                      -- school/company/club
  emergency_contact   TEXT,
  emergency_phone     TEXT,
  profile_photo       TEXT,
  consent_given       BOOLEAN NOT NULL DEFAULT FALSE,
  consent_date        DATE,
  status              participant_status NOT NULL DEFAULT 'active',
  notes               TEXT,
  registered_by       UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_participants_name       ON participants USING gin(full_name gin_trgm_ops);
CREATE INDEX idx_participants_ic         ON participants(ic_number) WHERE ic_number IS NOT NULL;
CREATE INDEX idx_participants_state      ON participants(state_id);
CREATE INDEX idx_participants_nadi       ON participants(nadi_id);
CREATE INDEX idx_participants_status     ON participants(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_participants_email      ON participants(email) WHERE email IS NOT NULL;

-- Auto-generate participant code
CREATE OR REPLACE FUNCTION generate_participant_code()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.participant_code IS NULL THEN
    NEW.participant_code := 'P' || LPAD(NEXTVAL('participant_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE SEQUENCE IF NOT EXISTS participant_seq START 1;

CREATE TRIGGER set_participant_code
  BEFORE INSERT ON participants
  FOR EACH ROW EXECUTE FUNCTION generate_participant_code();

-- ============================================================
-- PARTICIPANT PROGRAMME ENROLMENTS
-- ============================================================

CREATE TABLE participant_programmes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id  UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  programme_id    UUID NOT NULL REFERENCES programmes(id) ON DELETE RESTRICT,
  enrolled_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_date  DATE,
  status          TEXT NOT NULL DEFAULT 'active',   -- active, completed, withdrawn
  enrolled_by     UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(participant_id, programme_id)
);

CREATE INDEX idx_pp_participant ON participant_programmes(participant_id);
CREATE INDEX idx_pp_programme   ON participant_programmes(programme_id);
CREATE INDEX idx_pp_status      ON participant_programmes(status);

-- ============================================================
-- PARTICIPANT NADI ASSIGNMENTS (historical)
-- ============================================================

CREATE TABLE participant_nadi_assignments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  nadi_id        UUID NOT NULL REFERENCES nadi_sites(id) ON DELETE RESTRICT,
  assigned_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  is_primary     BOOLEAN NOT NULL DEFAULT TRUE,
  assigned_by    UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pna_participant ON participant_nadi_assignments(participant_id);
CREATE INDEX idx_pna_nadi        ON participant_nadi_assignments(nadi_id);

-- ============================================================
-- EVENTS
-- ============================================================

CREATE TABLE events (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_code           TEXT NOT NULL UNIQUE,
  event_name           TEXT NOT NULL,
  programme_id         UUID REFERENCES programmes(id) ON DELETE SET NULL,
  state_id             UUID REFERENCES states(id),
  nadi_id              UUID REFERENCES nadi_sites(id),
  event_type           TEXT,                          -- workshop, seminar, training, etc.
  venue                TEXT,
  event_date           DATE,
  start_time           TIME,
  end_time             TIME,
  trainer_id           UUID REFERENCES trainers(id),
  capacity             INTEGER,
  target_participants  INTEGER,
  actual_participants  INTEGER DEFAULT 0,
  status               event_status NOT NULL DEFAULT 'draft',
  description          TEXT,
  created_by           UUID REFERENCES auth.users(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at           TIMESTAMPTZ
);

CREATE INDEX idx_events_programme ON events(programme_id);
CREATE INDEX idx_events_state     ON events(state_id);
CREATE INDEX idx_events_nadi      ON events(nadi_id);
CREATE INDEX idx_events_date      ON events(event_date);
CREATE INDEX idx_events_status    ON events(status) WHERE deleted_at IS NULL;

-- Auto-generate event code
CREATE OR REPLACE FUNCTION generate_event_code()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.event_code IS NULL OR NEW.event_code = '' THEN
    NEW.event_code := 'EVT' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('event_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE SEQUENCE IF NOT EXISTS event_seq START 1;

CREATE TRIGGER set_event_code
  BEFORE INSERT ON events
  FOR EACH ROW EXECUTE FUNCTION generate_event_code();

-- ============================================================
-- EVENT SESSIONS
-- ============================================================

CREATE TABLE event_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id            UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  session_date        DATE,
  start_time          TIME,
  end_time            TIME,
  trainer_id          UUID REFERENCES trainers(id),
  module_id           UUID REFERENCES programme_modules(id),
  lesson_id           UUID REFERENCES lessons(id),
  attendance_required BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  status              session_status NOT NULL DEFAULT 'scheduled',
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_event ON event_sessions(event_id);
CREATE INDEX idx_sessions_date  ON event_sessions(session_date);

-- ============================================================
-- EVENT PARTICIPANTS (Registration)
-- ============================================================

CREATE TABLE event_participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  participant_id  UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  registered_by   UUID REFERENCES auth.users(id),
  status          TEXT NOT NULL DEFAULT 'registered',  -- registered, attended, absent, cancelled
  notes           TEXT,
  UNIQUE(event_id, participant_id)
);

CREATE INDEX idx_ep_event        ON event_participants(event_id);
CREATE INDEX idx_ep_participant  ON event_participants(participant_id);

-- ============================================================
-- ATTENDANCE
-- ============================================================

CREATE TABLE attendance (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       UUID REFERENCES events(id) ON DELETE CASCADE,
  session_id     UUID REFERENCES event_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  status         attendance_status NOT NULL DEFAULT 'present',
  check_in_time  TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  notes          TEXT,
  recorded_by    UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT attendance_scope CHECK (event_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX idx_attendance_event       ON attendance(event_id);
CREATE INDEX idx_attendance_session     ON attendance(session_id);
CREATE INDEX idx_attendance_participant ON attendance(participant_id);
CREATE INDEX idx_attendance_status      ON attendance(status);
CREATE INDEX idx_attendance_date        ON attendance(created_at);

-- ============================================================
-- LEARNING PROGRESS
-- ============================================================

CREATE TABLE learning_progress (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id        UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  programme_id          UUID NOT NULL REFERENCES programmes(id) ON DELETE CASCADE,
  module_id             UUID REFERENCES programme_modules(id),
  lesson_id             UUID REFERENCES lessons(id),
  content_id            UUID REFERENCES lesson_contents(id),
  started_at            TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,
  progress_pct          DECIMAL(5,2) DEFAULT 0,    -- 0-100
  video_watched_pct     DECIMAL(5,2),              -- for video content
  time_spent_sec        INTEGER DEFAULT 0,
  is_completed          BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(participant_id, programme_id, lesson_id)
);

CREATE INDEX idx_progress_participant ON learning_progress(participant_id);
CREATE INDEX idx_progress_programme   ON learning_progress(programme_id);
CREATE INDEX idx_progress_lesson      ON learning_progress(lesson_id);
CREATE INDEX idx_progress_completed   ON learning_progress(is_completed);

-- ============================================================
-- QUIZZES
-- ============================================================

CREATE TABLE quizzes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id        UUID REFERENCES lessons(id) ON DELETE CASCADE,
  programme_id     UUID REFERENCES programmes(id),
  title            TEXT NOT NULL,
  description      TEXT,
  pass_mark        DECIMAL(5,2) NOT NULL DEFAULT 70.00,
  time_limit_min   INTEGER,                         -- NULL = no limit
  max_attempts     INTEGER DEFAULT 3,
  randomize        BOOLEAN NOT NULL DEFAULT FALSE,
  questions_count  INTEGER,                         -- NULL = all questions
  show_feedback    BOOLEAN NOT NULL DEFAULT TRUE,
  status           TEXT NOT NULL DEFAULT 'published',
  created_by       UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quizzes_lesson ON quizzes(lesson_id);

-- ============================================================
-- QUIZ QUESTIONS
-- ============================================================

CREATE TABLE quiz_questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id         UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_type   quiz_question_type NOT NULL DEFAULT 'multiple_choice',
  question_text   TEXT NOT NULL,
  options         JSONB,          -- [{text, is_correct}]
  correct_answer  TEXT,           -- for short_answer / true_false
  explanation     TEXT,
  marks           DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_quiz ON quiz_questions(quiz_id);

-- ============================================================
-- QUIZ ATTEMPTS
-- ============================================================

CREATE TABLE quiz_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id         UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  participant_id  UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  attempt_number  INTEGER NOT NULL DEFAULT 1,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  score           DECIMAL(5,2),
  max_score       DECIMAL(5,2),
  percentage      DECIMAL(5,2),
  passed          BOOLEAN,
  time_taken_sec  INTEGER,
  graded_by       UUID REFERENCES auth.users(id),   -- NULL = auto-graded
  graded_at       TIMESTAMPTZ
);

CREATE INDEX idx_attempts_quiz        ON quiz_attempts(quiz_id);
CREATE INDEX idx_attempts_participant ON quiz_attempts(participant_id);

-- ============================================================
-- QUIZ ANSWERS
-- ============================================================

CREATE TABLE quiz_answers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id     UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id    UUID NOT NULL REFERENCES quiz_questions(id),
  answer_text    TEXT,
  selected_options JSONB,     -- [option_index]
  is_correct     BOOLEAN,
  marks_earned   DECIMAL(5,2),
  feedback       TEXT
);

CREATE INDEX idx_answers_attempt ON quiz_answers(attempt_id);

-- ============================================================
-- ASSESSMENTS
-- ============================================================

CREATE TABLE assessments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id    UUID REFERENCES programmes(id) ON DELETE CASCADE,
  lesson_id       UUID REFERENCES lessons(id),
  title           TEXT NOT NULL,
  description     TEXT,
  assessment_type TEXT NOT NULL DEFAULT 'practical',  -- written, practical, project, presentation, rubric
  max_score       DECIMAL(5,2) NOT NULL DEFAULT 100,
  pass_mark       DECIMAL(5,2) NOT NULL DEFAULT 70,
  rubric          JSONB,              -- rubric criteria
  instructions    TEXT,
  due_date        DATE,
  status          TEXT NOT NULL DEFAULT 'published',
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assessments_programme ON assessments(programme_id);

-- ============================================================
-- ASSESSMENT RESULTS
-- ============================================================

CREATE TABLE assessment_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id   UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  participant_id  UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  score           DECIMAL(5,2),
  max_score       DECIMAL(5,2),
  percentage      DECIMAL(5,2),
  passed          BOOLEAN,
  grade           TEXT,                    -- A, B, C, D, F
  feedback        TEXT,
  rubric_scores   JSONB,                   -- per-criterion scores
  graded_by       UUID REFERENCES auth.users(id),
  graded_at       TIMESTAMPTZ,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(assessment_id, participant_id)
);

CREATE INDEX idx_results_assessment  ON assessment_results(assessment_id);
CREATE INDEX idx_results_participant ON assessment_results(participant_id);

-- ============================================================
-- CERTIFICATE TEMPLATES
-- ============================================================

CREATE TABLE certificate_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id    UUID REFERENCES programmes(id),
  template_name   TEXT NOT NULL,
  template_html   TEXT,          -- HTML template with placeholders
  template_css    TEXT,
  issuer_name     TEXT NOT NULL DEFAULT 'SpectrumMY Programme',
  issuer_logo     TEXT,
  signature_name  TEXT,
  signature_image TEXT,
  is_default      BOOLEAN NOT NULL DEFAULT FALSE,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CERTIFICATES
-- ============================================================

CREATE TABLE certificates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_no   TEXT NOT NULL UNIQUE,    -- e.g. SpectrumMY-2026-000001
  participant_id   UUID NOT NULL REFERENCES participants(id) ON DELETE RESTRICT,
  programme_id     UUID NOT NULL REFERENCES programmes(id) ON DELETE RESTRICT,
  template_id      UUID REFERENCES certificate_templates(id),
  issue_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date      DATE,
  status           certificate_status NOT NULL DEFAULT 'pending',
  issued_by        UUID REFERENCES auth.users(id),
  issued_at        TIMESTAMPTZ,
  revoked_by       UUID REFERENCES auth.users(id),
  revoked_at       TIMESTAMPTZ,
  revoke_reason    TEXT,
  pdf_url          TEXT,                    -- stored in Supabase Storage
  qr_data          TEXT,                   -- QR verification payload
  metadata         JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_certs_participant ON certificates(participant_id);
CREATE INDEX idx_certs_programme   ON certificates(programme_id);
CREATE INDEX idx_certs_no          ON certificates(certificate_no);
CREATE INDEX idx_certs_status      ON certificates(status);

-- Auto-generate certificate number
CREATE OR REPLACE FUNCTION generate_certificate_no()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.certificate_no IS NULL OR NEW.certificate_no = '' THEN
    NEW.certificate_no := 'SpectrumMY-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('cert_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE SEQUENCE IF NOT EXISTS cert_seq START 1;

CREATE TRIGGER set_certificate_no
  BEFORE INSERT ON certificates
  FOR EACH ROW EXECUTE FUNCTION generate_certificate_no();

-- ============================================================
-- MEDIA REPOSITORY
-- ============================================================

CREATE TABLE media (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category        media_category NOT NULL,
  file_name       TEXT NOT NULL,
  original_name   TEXT,
  file_url        TEXT NOT NULL,          -- Supabase Storage path
  file_type       TEXT,                   -- MIME type
  file_size       BIGINT,
  duration_sec    INTEGER,                -- for video/audio
  thumbnail_url   TEXT,
  programme_id    UUID REFERENCES programmes(id),
  module_id       UUID REFERENCES programme_modules(id),
  lesson_id       UUID REFERENCES lessons(id),
  event_id        UUID REFERENCES events(id),
  session_id      UUID REFERENCES event_sessions(id),
  state_id        UUID REFERENCES states(id),
  nadi_id         UUID REFERENCES nadi_sites(id),
  trainer_id      UUID REFERENCES trainers(id),
  participant_id  UUID REFERENCES participants(id),
  title           TEXT,
  description     TEXT,
  tags            TEXT[],
  is_public       BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_by     UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_media_category   ON media(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_media_programme  ON media(programme_id);
CREATE INDEX idx_media_event      ON media(event_id);
CREATE INDEX idx_media_nadi       ON media(nadi_id);
CREATE INDEX idx_media_name       ON media USING gin(title gin_trgm_ops);

-- ============================================================
-- KPI DEFINITIONS
-- ============================================================

CREATE TABLE kpis (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_code        TEXT NOT NULL UNIQUE,
  kpi_name        TEXT NOT NULL,
  description     TEXT,
  unit            TEXT NOT NULL DEFAULT 'count',  -- count, percentage, etc.
  category        TEXT,                           -- participation, completion, attendance, etc.
  applies_to      TEXT NOT NULL DEFAULT 'programme',   -- programme, state, nadi, event
  programme_id    UUID REFERENCES programmes(id),
  state_id        UUID REFERENCES states(id),
  nadi_id         UUID REFERENCES nadi_sites(id),
  period          kpi_period NOT NULL DEFAULT 'yearly',
  target_value    DECIMAL(10,2),
  warning_threshold  DECIMAL(5,2) DEFAULT 70,    -- below this = warning
  critical_threshold DECIMAL(5,2) DEFAULT 50,    -- below this = critical
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kpi_programme ON kpis(programme_id);
CREATE INDEX idx_kpi_state     ON kpis(state_id);
CREATE INDEX idx_kpi_nadi      ON kpis(nadi_id);

-- ============================================================
-- KPI TARGETS
-- ============================================================

CREATE TABLE kpi_targets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id       UUID NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
  period_year  INTEGER NOT NULL,
  period_month INTEGER,                            -- NULL = full year
  period_q     INTEGER,                            -- NULL or 1-4
  target_value DECIMAL(10,2) NOT NULL,
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kpi_targets_kpi ON kpi_targets(kpi_id);

-- ============================================================
-- KPI RESULTS (Actual values, calculated or manually entered)
-- ============================================================

CREATE TABLE kpi_results (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id       UUID NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
  period_year  INTEGER NOT NULL,
  period_month INTEGER,
  period_q     INTEGER,
  actual_value DECIMAL(10,2),
  target_value DECIMAL(10,2),
  achievement_pct DECIMAL(5,2),
  status       TEXT,                              -- on_target, near_target, below_target
  notes        TEXT,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  calculated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_kpi_results_kpi  ON kpi_results(kpi_id);
CREATE INDEX idx_kpi_results_year ON kpi_results(period_year);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id),
  action          audit_action NOT NULL,
  entity_type     TEXT,                           -- table name
  entity_id       UUID,
  old_values      JSONB,
  new_values      JSONB,
  ip_address      INET,
  user_agent      TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user   ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_date   ON audit_logs(created_at DESC);

-- ============================================================
-- SYSTEM SETTINGS
-- ============================================================

CREATE TABLE system_settings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key   TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type  TEXT NOT NULL DEFAULT 'string',   -- string, number, boolean, json
  category      TEXT,
  description   TEXT,
  updated_by    UUID REFERENCES auth.users(id),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_settings_key      ON system_settings(setting_key);
CREATE INDEX idx_settings_category ON system_settings(category);

-- ============================================================
-- REPORTS (Saved report configurations)
-- ============================================================

CREATE TABLE reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_name   TEXT NOT NULL,
  report_type   TEXT NOT NULL,
  filters       JSONB,              -- saved filter state
  columns       TEXT[],             -- selected columns
  created_by    UUID REFERENCES auth.users(id),
  is_shared     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to all relevant tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'states','nadi_sites','profiles','trainers','programmes',
    'programme_modules','lessons','lesson_contents','participants',
    'participant_programmes','events','event_sessions','attendance',
    'quizzes','assessments','certificate_templates','certificates',
    'media','kpis','reports'
  ] LOOP
    EXECUTE format(
      'CREATE OR REPLACE TRIGGER set_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t
    );
  END LOOP;
END;
$$;

-- ============================================================
-- DEFAULT SYSTEM SETTINGS
-- ============================================================

INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description) VALUES
  ('org_name',            'SpectrumMY Programme',                     'string',  'organization',  'Organisation display name'),
  ('org_full_name',       'SpectrumMY Programme & Learning Management System', 'string', 'organization', 'Full organisation name'),
  ('org_country',         'Malaysia',                             'string',  'organization',  'Country'),
  ('cert_issuer',         'SpectrumMY Programme',                     'string',  'certificate',   'Default certificate issuer name'),
  ('cert_validity_years', '2',                                    'number',  'certificate',   'Certificate validity in years (0 = no expiry)'),
  ('attendance_late_min', '15',                                   'number',  'attendance',    'Minutes after start considered late'),
  ('completion_min_pct',  '80',                                   'number',  'completion',    'Default minimum completion percentage for certificate'),
  ('age_bands',           '[[7,12],[13,17],[18,24],[25,39],[40,999]]', 'json', 'analytics',   'Age band definitions [min,max]'),
  ('max_upload_mb',       '500',                                  'number',  'storage',       'Maximum file upload size in MB'),
  ('allowed_video_types', '["mp4","webm","mov","avi"]',           'json',    'storage',       'Allowed video file types'),
  ('kpi_warning_pct',     '70',                                   'number',  'kpi',           'KPI warning threshold percentage'),
  ('kpi_critical_pct',    '50',                                   'number',  'kpi',           'KPI critical threshold percentage'),
  ('app_version',         '1.0.0',                                'string',  'system',        'Application version');

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE states                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE nadi_sites               ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE programmes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_modules        ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_contents          ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants             ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_programmes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_nadi_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE events                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sessions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants       ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance               ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress        ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results       ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_templates    ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates             ENABLE ROW LEVEL SECURITY;
ALTER TABLE media                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_targets              ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_results              ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports                  ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION auth_role()
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Helper function: get current user's state_id
CREATE OR REPLACE FUNCTION auth_state_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT state_id FROM profiles WHERE id = auth.uid();
$$;

-- Helper function: get current user's nadi_id
CREATE OR REPLACE FUNCTION auth_nadi_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT nadi_id FROM profiles WHERE id = auth.uid();
$$;

-- ─── STATES POLICIES ──────────────────────────────────────────────────────

-- Everyone authenticated can read states
CREATE POLICY "states_read_all" ON states FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only super_admin and programme_admin can write
CREATE POLICY "states_write_admin" ON states FOR ALL
  USING (auth_role() IN ('super_admin', 'programme_admin'));

-- ─── NADI SITES POLICIES ──────────────────────────────────────────────────

CREATE POLICY "nadi_read_all" ON nadi_sites FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "nadi_write_super" ON nadi_sites FOR ALL
  USING (auth_role() IN ('super_admin', 'programme_admin'));

CREATE POLICY "nadi_write_nadi_admin" ON nadi_sites FOR UPDATE
  USING (auth_role() = 'nadi_admin' AND id = auth_nadi_id());

-- ─── PROFILES POLICIES ────────────────────────────────────────────────────

-- Users can read their own profile
CREATE POLICY "profiles_read_own" ON profiles FOR SELECT
  USING (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "profiles_read_admin" ON profiles FOR SELECT
  USING (auth_role() IN ('super_admin', 'programme_admin', 'state_admin'));

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Super admin can do anything
CREATE POLICY "profiles_all_super" ON profiles FOR ALL
  USING (auth_role() = 'super_admin');

-- ─── PROGRAMMES POLICIES ──────────────────────────────────────────────────

CREATE POLICY "programmes_read_all" ON programmes FOR SELECT
  USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);

CREATE POLICY "programmes_write_admin" ON programmes FOR ALL
  USING (auth_role() IN ('super_admin', 'programme_admin'));

-- ─── MODULES / LESSONS / CONTENT POLICIES ─────────────────────────────────

CREATE POLICY "modules_read_all" ON programme_modules FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "modules_write_admin" ON programme_modules FOR ALL
  USING (auth_role() IN ('super_admin', 'programme_admin'));

CREATE POLICY "lessons_read_all" ON lessons FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "lessons_write_admin" ON lessons FOR ALL
  USING (auth_role() IN ('super_admin', 'programme_admin'));

CREATE POLICY "content_read_all" ON lesson_contents FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "content_write_admin" ON lesson_contents FOR ALL
  USING (auth_role() IN ('super_admin', 'programme_admin'));

-- ─── PARTICIPANTS POLICIES ─────────────────────────────────────────────────

-- Super admin and programme admin: all participants
CREATE POLICY "participants_read_admin" ON participants FOR SELECT
  USING (auth_role() IN ('super_admin', 'programme_admin') AND deleted_at IS NULL);

-- State admin: participants in their state
CREATE POLICY "participants_read_state" ON participants FOR SELECT
  USING (auth_role() = 'state_admin' AND state_id = auth_state_id() AND deleted_at IS NULL);

-- NADI admin: participants in their NADI
CREATE POLICY "participants_read_nadi" ON participants FOR SELECT
  USING (auth_role() IN ('nadi_admin', 'registrar') AND nadi_id = auth_nadi_id() AND deleted_at IS NULL);

-- Write permissions for admin roles
CREATE POLICY "participants_write_admin" ON participants FOR ALL
  USING (auth_role() IN ('super_admin', 'programme_admin'));

CREATE POLICY "participants_write_registrar" ON participants FOR INSERT
  WITH CHECK (auth_role() IN ('registrar', 'nadi_admin'));

CREATE POLICY "participants_update_registrar" ON participants FOR UPDATE
  USING (auth_role() IN ('registrar', 'nadi_admin') AND nadi_id = auth_nadi_id());

-- ─── EVENTS POLICIES ──────────────────────────────────────────────────────

CREATE POLICY "events_read_all" ON events FOR SELECT
  USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);

CREATE POLICY "events_write_admin" ON events FOR ALL
  USING (auth_role() IN ('super_admin', 'programme_admin'));

CREATE POLICY "events_write_nadi" ON events FOR INSERT
  WITH CHECK (auth_role() = 'nadi_admin' AND nadi_id = auth_nadi_id());

CREATE POLICY "events_update_nadi" ON events FOR UPDATE
  USING (auth_role() = 'nadi_admin' AND nadi_id = auth_nadi_id());

-- ─── ATTENDANCE POLICIES ──────────────────────────────────────────────────

CREATE POLICY "attendance_read_all" ON attendance FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "attendance_write_all" ON attendance FOR ALL
  USING (auth_role() IN ('super_admin', 'programme_admin', 'nadi_admin', 'trainer', 'registrar'));

-- ─── CERTIFICATES POLICIES ────────────────────────────────────────────────

-- Public read (for verification) — requires certificate_no
-- This is handled via a separate public-facing API route, not direct RLS
CREATE POLICY "certs_read_admin" ON certificates FOR SELECT
  USING (auth_role() IN ('super_admin', 'programme_admin', 'state_admin', 'nadi_admin', 'observer'));

CREATE POLICY "certs_write_admin" ON certificates FOR ALL
  USING (auth_role() IN ('super_admin', 'programme_admin'));

-- ─── MEDIA POLICIES ──────────────────────────────────────────────────────

CREATE POLICY "media_read_all" ON media FOR SELECT
  USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);

CREATE POLICY "media_write_admin" ON media FOR ALL
  USING (auth_role() IN ('super_admin', 'programme_admin', 'nadi_admin'));

-- ─── KPI POLICIES ─────────────────────────────────────────────────────────

CREATE POLICY "kpi_read_all" ON kpis FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "kpi_write_admin" ON kpis FOR ALL
  USING (auth_role() IN ('super_admin', 'programme_admin'));

CREATE POLICY "kpi_targets_read" ON kpi_targets FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "kpi_targets_write" ON kpi_targets FOR ALL
  USING (auth_role() IN ('super_admin', 'programme_admin'));

CREATE POLICY "kpi_results_read" ON kpi_results FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "kpi_results_write" ON kpi_results FOR ALL
  USING (auth_role() IN ('super_admin', 'programme_admin'));

-- ─── AUDIT LOG POLICIES ───────────────────────────────────────────────────

-- Only super_admin can read all audit logs
CREATE POLICY "audit_read_super" ON audit_logs FOR SELECT
  USING (auth_role() = 'super_admin');

-- Any authenticated user can insert (server-side logging)
CREATE POLICY "audit_insert_all" ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ─── SYSTEM SETTINGS POLICIES ─────────────────────────────────────────────

CREATE POLICY "settings_read_admin" ON system_settings FOR SELECT
  USING (auth_role() IN ('super_admin', 'programme_admin'));

CREATE POLICY "settings_write_super" ON system_settings FOR ALL
  USING (auth_role() = 'super_admin');

-- ─── OBSERVER: READ-ONLY ENFORCEMENT ──────────────────────────────────────
-- Observer has SELECT on key tables but NO INSERT/UPDATE/DELETE
-- This is enforced by the above policies only granting SELECT where observer is included
-- and ALL policies for write operations explicitly exclude observer role

-- ============================================================
-- INDEXES for PERFORMANCE
-- ============================================================

-- Composite indexes for common report queries
CREATE INDEX idx_attendance_event_participant    ON attendance(event_id, participant_id);
CREATE INDEX idx_progress_participant_programme  ON learning_progress(participant_id, programme_id);
CREATE INDEX idx_certs_participant_status        ON certificates(participant_id, status);
CREATE INDEX idx_events_nadi_date               ON events(nadi_id, event_date);
CREATE INDEX idx_participants_state_nadi        ON participants(state_id, nadi_id);
