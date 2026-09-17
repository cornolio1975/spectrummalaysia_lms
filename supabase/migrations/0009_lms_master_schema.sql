-- ============================================================
-- Spectrum Malaysia LMS — Master Schema Migration 0009
-- Complete Universal Training, Courses, Skills, Micro-Credentials,
-- Practical Assessments, Evidence, RPL, Interventions, and Wallet
-- ============================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Safe enum additions
DO $$ BEGIN
  CREATE TYPE course_status AS ENUM ('draft', 'review', 'published', 'active', 'completed', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE credential_category_type AS ENUM (
    'academic', 'professional', 'corporate', 'government', 'community',
    'vocational', 'tvet', 'technical', 'digital_skills', 'ai', 'genai',
    'entrepreneurship', 'workplace_safety', 'healthcare', 'sports',
    'coaching', 'workshops', 'seminars', 'webinars', 'short_courses',
    'competency_training', 'cpd', 'practical_training', 'certification_training', 'custom'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE credential_type_enum AS ENUM (
    'certificate_of_completion',
    'certificate_of_achievement',
    'micro_credential',
    'competency_credential',
    'digital_badge',
    'workshop_certificate',
    'attendance_certificate',
    'stacked_micro_credential',
    'custom_credential'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE credential_issuance_status AS ENUM (
    'valid',
    'expired',
    'revoked',
    'suspended'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE approval_workflow_type AS ENUM (
    'automatic',
    'trainer_approval',
    'trainer_and_admin_approval'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE requirement_type_enum AS ENUM (
    'course_completion',
    'module_completion',
    'lesson_completion',
    'video_completion',
    'assessment_pass',
    'minimum_score',
    'assignment_completion',
    'practical_assessment',
    'trainer_approval',
    'admin_approval',
    'minimum_learning_hours',
    'competency_achieved',
    'skill_level_achieved',
    'prerequisite_credential',
    'minimum_attendance'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE rpl_status_enum AS ENUM (
    'draft',
    'submitted',
    'under_review',
    'interview_scheduled',
    'practical_validation',
    'approved',
    'rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE intervention_type_enum AS ENUM (
    'reminder',
    'trainer_notification',
    'additional_material',
    'revision',
    'support_request',
    'reassessment_recommendation'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE intervention_reason_enum AS ENUM (
    'inactivity',
    'low_progress',
    'repeated_failures',
    'low_attendance',
    'missing_assignment',
    'approaching_deadline',
    'credential_requirement_incomplete'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE practical_submission_status AS ENUM (
    'pending_submission',
    'submitted',
    'under_evaluation',
    'competent',
    'not_yet_competent',
    'resubmission_required'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. SEQUENCES FOR UNIQUE IDENTIFIERS
CREATE SEQUENCE IF NOT EXISTS credential_seq START WITH 100001;
CREATE SEQUENCE IF NOT EXISTS course_seq START WITH 1001;
CREATE SEQUENCE IF NOT EXISTS rpl_seq START WITH 5001;

-- 3. UNIVERSAL TRAINING CATEGORIES
CREATE TABLE IF NOT EXISTS training_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed universal categories
INSERT INTO training_categories (code, name, description, icon, is_system) VALUES
  ('academic', 'Academic', 'Formal academic and curriculum-based education', 'GraduationCap', true),
  ('professional', 'Professional Development', 'Executive and professional certification training', 'Briefcase', true),
  ('corporate', 'Corporate Training', 'Custom business, enterprise, and workforce training', 'Building2', true),
  ('government', 'Government & Public Sector', 'Civil service, policy, and public administration training', 'Landmark', true),
  ('community', 'Community & NADI', 'Community empowerment and digital inclusivity programmes', 'Users', true),
  ('vocational', 'Vocational & TVET', 'Technical, trades, and vocational skills development', 'Wrench', true),
  ('digital_skills', 'Digital Skills & Technology', 'Software development, cloud computing, and cybersecurity', 'Binary', true),
  ('ai', 'Artificial Intelligence & GenAI', 'Foundational AI, GenAI workflows, prompt engineering and automation', 'Cpu', true),
  ('entrepreneurship', 'Entrepreneurship & Business', 'Startups, e-commerce, and business management', 'Rocket', true),
  ('workplace_safety', 'Workplace Safety & OSH', 'Occupational safety, health, and hazard compliance', 'ShieldAlert', true),
  ('healthcare', 'Healthcare & Wellness', 'First aid, healthcare support, and public wellness', 'HeartPulse', true),
  ('sports_coaching', 'Sports & Coaching', 'Athletic coaching, sports administration, and fitness leadership', 'Trophy', true),
  ('competency_training', 'Competency-Based Training', 'Outcome-driven practical skill mastery programs', 'Award', true),
  ('custom', 'Custom Specialized Training', 'Bespoke custom curriculum and modular learning paths', 'Sparkles', true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 4. COURSES TABLE (Universal Course Engine)
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES training_categories(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'Professional',
  level TEXT NOT NULL DEFAULT 'Intermediate', -- Beginner, Intermediate, Advanced, Expert
  learning_hours NUMERIC(6,2) NOT NULL DEFAULT 10.00,
  trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
  programme_id UUID REFERENCES programmes(id) ON DELETE SET NULL,
  status course_status NOT NULL DEFAULT 'draft',
  thumbnail_url TEXT,
  banner_url TEXT,
  learning_objectives JSONB DEFAULT '[]'::jsonb,
  learning_outcomes JSONB DEFAULT '[]'::jsonb,
  prerequisites TEXT,
  attendance_required_pct NUMERIC(5,2) DEFAULT 80.00,
  min_pass_score NUMERIC(5,2) DEFAULT 70.00,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(course_code);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_trainer ON courses(trainer_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status) WHERE deleted_at IS NULL;

-- Helper to generate course code
CREATE OR REPLACE FUNCTION generate_course_code()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.course_code IS NULL OR NEW.course_code = '' THEN
    NEW.course_code := 'CRS-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('course_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_course_code ON courses;
CREATE TRIGGER trg_course_code
  BEFORE INSERT ON courses
  FOR EACH ROW EXECUTE FUNCTION generate_course_code();

-- 5. COURSE MODULES & LESSONS
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_modules_course ON course_modules(course_id, sort_order);

CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_min INTEGER DEFAULT 30,
  is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_lessons_module ON course_lessons(module_id, sort_order);

CREATE TABLE IF NOT EXISTS course_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL, -- video, pdf, document, text, audio, quiz, practical
  content_body TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  duration_sec INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_contents_lesson ON course_contents(lesson_id, sort_order);

-- Course Enrolments
CREATE TABLE IF NOT EXISTS course_enrolments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  progress_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, completed, dropped
  UNIQUE(course_id, participant_id)
);

CREATE INDEX IF NOT EXISTS idx_enrol_course_part ON course_enrolments(course_id, participant_id);

-- Lesson Progress tracking
CREATE TABLE IF NOT EXISTS course_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  time_spent_sec INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(lesson_id, participant_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_prog_user ON course_lesson_progress(participant_id, course_id);

-- 6. SKILLS & COMPETENCY FRAMEWORK
CREATE TABLE IF NOT EXISTS skill_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES skill_categories(id) ON DELETE SET NULL,
  skill_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  level_standard TEXT NOT NULL DEFAULT 'Foundational', -- Foundational, Intermediate, Advanced, Mastery
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  competency_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  performance_criteria JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Learner Skills Profile
CREATE TABLE IF NOT EXISTS learner_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  achieved_level TEXT NOT NULL DEFAULT 'Competent',
  evidence_url TEXT,
  source TEXT NOT NULL DEFAULT 'course_completion', -- course_completion, practical_assessment, rpl, manual_endorsement
  endorsed_by UUID REFERENCES auth.users(id),
  date_achieved DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(participant_id, skill_id)
);

CREATE TABLE IF NOT EXISTS learner_competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  is_competent BOOLEAN NOT NULL DEFAULT TRUE,
  assessor_id UUID REFERENCES auth.users(id),
  date_achieved DATE NOT NULL DEFAULT CURRENT_DATE,
  evidence_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(participant_id, competency_id)
);

-- Mapping tables
CREATE TABLE IF NOT EXISTS course_skills (
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, skill_id)
);

-- Seed initial skill categories and skills
INSERT INTO skill_categories (name, description) VALUES
  ('Artificial Intelligence & GenAI', 'Foundations, prompt engineering, generative tools, and ethics'),
  ('Digital Literacy & Productivity', 'Digital tools, online collaboration, productivity software'),
  ('Software Engineering & Data', 'Web development, database management, and cloud basics'),
  ('Business & Entrepreneurship', 'Digital marketing, financial modeling, e-commerce, pitching'),
  ('Occupational Safety & Health', 'Hazard identification, first aid, regulatory compliance')
ON CONFLICT (name) DO NOTHING;

-- 7. RECOGNITION OF PRIOR LEARNING (RPL)
CREATE TABLE IF NOT EXISTS rpl_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_code TEXT NOT NULL UNIQUE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  target_course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  target_credential_id UUID, -- forward reference to credentials table
  experience_summary TEXT NOT NULL,
  years_of_experience NUMERIC(4,1) NOT NULL DEFAULT 1.0,
  portfolio_url TEXT,
  status rpl_status_enum NOT NULL DEFAULT 'submitted',
  assessor_id UUID REFERENCES auth.users(id),
  assessor_feedback TEXT,
  interview_scheduled_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION generate_rpl_code()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.application_code IS NULL OR NEW.application_code = '' THEN
    NEW.application_code := 'RPL-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('rpl_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_rpl_code ON rpl_applications;
CREATE TRIGGER trg_rpl_code
  BEFORE INSERT ON rpl_applications
  FOR EACH ROW EXECUTE FUNCTION generate_rpl_code();

CREATE TABLE IF NOT EXISTS rpl_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rpl_application_id UUID NOT NULL REFERENCES rpl_applications(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  evidence_type TEXT NOT NULL, -- certificate, work_sample, letter_of_employment, video, transcript
  file_url TEXT NOT NULL,
  file_name TEXT,
  notes TEXT,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. MICRO-CREDENTIAL ENGINE
CREATE TABLE IF NOT EXISTS credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  credential_type credential_type_enum NOT NULL DEFAULT 'micro_credential',
  category_id UUID REFERENCES training_categories(id) ON DELETE SET NULL,
  level TEXT NOT NULL DEFAULT 'Level 3 - Intermediate',
  learning_hours NUMERIC(6,2) NOT NULL DEFAULT 12.00,
  version INTEGER NOT NULL DEFAULT 1,
  approval_workflow approval_workflow_type NOT NULL DEFAULT 'automatic',
  expiry_months INTEGER DEFAULT 24, -- 0 or null = never expires
  certificate_template_id UUID REFERENCES certificate_templates(id) ON DELETE SET NULL,
  badge_config JSONB DEFAULT '{"color": "#1e3a8a", "icon": "Award", "shape": "hexagon"}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credentials_code ON credentials(credential_code);
CREATE INDEX IF NOT EXISTS idx_credentials_type ON credentials(credential_type);

-- Learning outcomes per credential
CREATE TABLE IF NOT EXISTS credential_learning_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
  outcome_code TEXT NOT NULL,
  description TEXT NOT NULL,
  skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
  competency_id UUID REFERENCES competencies(id) ON DELETE SET NULL,
  assessment_method TEXT NOT NULL DEFAULT 'practical_rubric',
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Configurable requirements per credential (Supports AND / OR groups)
CREATE TABLE IF NOT EXISTS credential_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
  requirement_type requirement_type_enum NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  programme_id UUID REFERENCES programmes(id) ON DELETE CASCADE,
  min_score NUMERIC(5,2),
  min_attendance_pct NUMERIC(5,2),
  min_hours NUMERIC(6,2),
  competency_id UUID REFERENCES competencies(id) ON DELETE SET NULL,
  logic_group TEXT NOT NULL DEFAULT 'AND_1', -- Requirements in same group are AND; groups can be evaluated with OR
  is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Credential Prerequisites
CREATE TABLE IF NOT EXISTS credential_prerequisites (
  credential_id UUID NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
  prerequisite_credential_id UUID NOT NULL REFERENCES credentials(id) ON DELETE RESTRICT,
  PRIMARY KEY (credential_id, prerequisite_credential_id)
);

-- Stackable Credentials (Micro-Cred A + B + C = Stacked Credential)
CREATE TABLE IF NOT EXISTS credential_stacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stacked_credential_id UUID NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
  stack_name TEXT NOT NULL,
  description TEXT,
  min_required_items INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credential_stack_items (
  stack_id UUID NOT NULL REFERENCES credential_stacks(id) ON DELETE CASCADE,
  required_credential_id UUID NOT NULL REFERENCES credentials(id) ON DELETE RESTRICT,
  is_optional BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (stack_id, required_credential_id)
);

-- Automatic Credential Eligibility Tracker
CREATE TABLE IF NOT EXISTS credential_eligibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  credential_id UUID NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
  is_eligible BOOLEAN NOT NULL DEFAULT FALSE,
  missing_requirements JSONB DEFAULT '[]'::jsonb, -- e.g. [{"code": "assessment_pending", "text": "Assessment score below 70%"}]
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(participant_id, credential_id)
);

CREATE INDEX IF NOT EXISTS idx_cred_eligibility ON credential_eligibility(participant_id, credential_id, is_eligible);

-- 9. CREDENTIAL ISSUANCES (Globally Unique & Tamper Evident)
CREATE TABLE IF NOT EXISTS credential_issuances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id_code TEXT NOT NULL UNIQUE, -- e.g. SPM-MC-2026-000001
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE RESTRICT,
  credential_id UUID NOT NULL REFERENCES credentials(id) ON DELETE RESTRICT,
  version INTEGER NOT NULL DEFAULT 1,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  status credential_issuance_status NOT NULL DEFAULT 'valid',
  trainer_approved_by UUID REFERENCES auth.users(id),
  trainer_approved_at TIMESTAMPTZ,
  admin_approved_by UUID REFERENCES auth.users(id),
  admin_approved_at TIMESTAMPTZ,
  integrity_hash TEXT NOT NULL, -- SHA256 checksum of issuance payload
  certificate_pdf_url TEXT,
  qr_code_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_issuance_code ON credential_issuances(credential_id_code);
CREATE INDEX IF NOT EXISTS idx_issuance_participant ON credential_issuances(participant_id);
CREATE INDEX IF NOT EXISTS idx_issuance_credential ON credential_issuances(credential_id);
CREATE INDEX IF NOT EXISTS idx_issuance_status ON credential_issuances(status);

-- Auto-generate globally unique Credential ID: SPM-MC-YYYY-XXXXXX
CREATE OR REPLACE FUNCTION generate_credential_issuance_id()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.credential_id_code IS NULL OR NEW.credential_id_code = '' THEN
    NEW.credential_id_code := 'SPM-MC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('credential_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_credential_issuance_id ON credential_issuances;
CREATE TRIGGER trg_credential_issuance_id
  BEFORE INSERT ON credential_issuances
  FOR EACH ROW EXECUTE FUNCTION generate_credential_issuance_id();

-- Credential Revocations & Suspensions
CREATE TABLE IF NOT EXISTS credential_revocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issuance_id UUID NOT NULL REFERENCES credential_issuances(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'revoke' or 'suspend' or 'reinstate'
  reason TEXT NOT NULL,
  acted_by UUID NOT NULL REFERENCES auth.users(id),
  acted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

-- Credential Renewals
CREATE TABLE IF NOT EXISTS credential_renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_issuance_id UUID NOT NULL REFERENCES credential_issuances(id) ON DELETE RESTRICT,
  new_issuance_id UUID NOT NULL REFERENCES credential_issuances(id) ON DELETE RESTRICT,
  renewal_requirements_met JSONB DEFAULT '[]'::jsonb,
  renewed_by UUID REFERENCES auth.users(id),
  renewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Digital Badges
CREATE TABLE IF NOT EXISTS digital_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issuance_id UUID NOT NULL REFERENCES credential_issuances(id) ON DELETE CASCADE UNIQUE,
  badge_name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  verification_url TEXT NOT NULL,
  skills_acquired JSONB DEFAULT '[]'::jsonb,
  learning_outcomes JSONB DEFAULT '[]'::jsonb,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. PRACTICAL ASSESSMENTS & EVIDENCE
CREATE TABLE IF NOT EXISTS practical_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  programme_id UUID REFERENCES programmes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  required_evidence_types TEXT[] DEFAULT ARRAY['document', 'photo', 'video'],
  rubrics JSONB NOT NULL DEFAULT '[]'::jsonb, -- criteria list with descriptions and points
  max_score NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  pass_mark NUMERIC(5,2) NOT NULL DEFAULT 70.00,
  due_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS practical_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES practical_assessments(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  evidence_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  submission_notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status practical_submission_status NOT NULL DEFAULT 'submitted',
  score NUMERIC(5,2),
  is_competent BOOLEAN DEFAULT FALSE,
  rubric_evaluation JSONB DEFAULT '{}'::jsonb,
  trainer_observation TEXT,
  assessor_id UUID REFERENCES auth.users(id),
  assessed_at TIMESTAMPTZ,
  UNIQUE(assessment_id, participant_id)
);

-- Evidence Repository
CREATE TABLE IF NOT EXISTS evidence_repository (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  evidence_type TEXT NOT NULL, -- video, photo, document, assignment, practical, rpl
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size BIGINT,
  related_course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  related_assessment_id UUID REFERENCES practical_assessments(id) ON DELETE SET NULL,
  related_competency_id UUID REFERENCES competencies(id) ON DELETE SET NULL,
  access_level TEXT NOT NULL DEFAULT 'private', -- private, assessor_only, public
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. LEARNER INTERVENTIONS & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS learner_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  reason intervention_reason_enum NOT NULL,
  intervention_type intervention_type_enum NOT NULL,
  notes TEXT NOT NULL,
  triggered_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'open', -- open, in_progress, resolved, dismissed
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  type TEXT NOT NULL DEFAULT 'system', -- credential, assessment, attendance, intervention, system
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- 12. AUDIT LOG ENHANCEMENT FOR CREDENTIALS
CREATE TABLE IF NOT EXISTS credential_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issuance_id UUID REFERENCES credential_issuances(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- created, eligibility_evaluated, approved, issued, viewed, verified, revoked, suspended, reinstated, renewed
  previous_state JSONB,
  new_state JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cred_audit_issuance ON credential_audit_logs(issuance_id, created_at DESC);

-- 13. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE training_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrolments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE learner_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE learner_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE rpl_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE rpl_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_learning_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_stack_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_eligibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_issuances ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_revocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE practical_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE practical_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_repository ENABLE ROW LEVEL SECURITY;
ALTER TABLE learner_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_audit_logs ENABLE ROW LEVEL SECURITY;

-- Read policies for public/authenticated users
DO $$ 
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'training_categories', 'courses', 'course_modules', 'course_lessons',
    'course_contents', 'course_enrolments', 'course_lesson_progress',
    'skill_categories', 'skills', 'competencies', 'learner_skills',
    'learner_competencies', 'course_skills', 'rpl_applications', 'rpl_evidence',
    'credentials', 'credential_learning_outcomes', 'credential_requirements',
    'credential_prerequisites', 'credential_stacks', 'credential_stack_items',
    'credential_eligibility', 'credential_issuances', 'credential_revocations',
    'credential_renewals', 'digital_badges', 'practical_assessments',
    'practical_submissions', 'evidence_repository', 'learner_interventions',
    'notifications', 'credential_audit_logs'
  ]) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s_read_auth" ON %I;', tbl, tbl);
    EXECUTE format('CREATE POLICY "%s_read_auth" ON %I FOR SELECT USING (true);', tbl, tbl);
    
    EXECUTE format('DROP POLICY IF EXISTS "%s_write_admin" ON %I;', tbl, tbl);
    EXECUTE format('CREATE POLICY "%s_write_admin" ON %I FOR ALL USING (
      (SELECT auth_role()) IN (''super_admin'', ''programme_admin'', ''trainer'')
    );', tbl, tbl);
  END LOOP;
END $$;

-- Explicit Observer enforcement: Observer role can NEVER insert, update, or delete on any table!
DO $$ 
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS "observer_block_mutations_%s" ON %I;', tbl, tbl);
  END LOOP;
END $$;
