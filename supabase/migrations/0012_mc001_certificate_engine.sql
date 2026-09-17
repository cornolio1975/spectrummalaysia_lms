-- ============================================================
-- Migration 0012: Complete Certificate Creation Engine & MC-001
-- Spectrum Malaysia LMS
-- ============================================================

-- 1. Ensure certificate_status enum includes all required states
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'certificate_status') THEN
    BEGIN
      ALTER TYPE certificate_status ADD VALUE IF NOT EXISTS 'not_eligible';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER TYPE certificate_status ADD VALUE IF NOT EXISTS 'eligible';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER TYPE certificate_status ADD VALUE IF NOT EXISTS 'issued';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER TYPE certificate_status ADD VALUE IF NOT EXISTS 'revoked';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER TYPE certificate_status ADD VALUE IF NOT EXISTS 'replaced';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- 2. Enhance certificate_templates table
ALTER TABLE certificate_templates
  ADD COLUMN IF NOT EXISTS template_code TEXT,
  ADD COLUMN IF NOT EXISTS version TEXT NOT NULL DEFAULT '1.0',
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS issuer_title TEXT DEFAULT 'Academic Director & Registrar',
  ADD COLUMN IF NOT EXISTS issuer_organisation TEXT DEFAULT 'Spectrum Malaysia Learning Council',
  ADD COLUMN IF NOT EXISTS signature_title TEXT DEFAULT 'Authorized Signatory',
  ADD COLUMN IF NOT EXISTS signature_svg TEXT,
  ADD COLUMN IF NOT EXISTS border_style TEXT DEFAULT 'royal_gold',
  ADD COLUMN IF NOT EXISTS body_text TEXT;

-- 3. Enhance certificates table for immutability, replacement tracking, and metadata
ALTER TABLE certificates
  ALTER COLUMN programme_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS credential_id UUID REFERENCES credentials(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS snapshot_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS original_certificate_id UUID REFERENCES certificates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS replacement_certificate_id UUID REFERENCES certificates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS replacement_reason TEXT,
  ADD COLUMN IF NOT EXISTS template_version TEXT NOT NULL DEFAULT '1.0',
  ADD COLUMN IF NOT EXISTS verification_url TEXT,
  ADD COLUMN IF NOT EXISTS integrity_hash TEXT,
  ADD COLUMN IF NOT EXISTS learning_hours NUMERIC DEFAULT 16,
  ADD COLUMN IF NOT EXISTS completion_date DATE DEFAULT CURRENT_DATE;

-- Add indexes for fast certificate lookups
CREATE INDEX IF NOT EXISTS idx_certs_course ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certs_credential ON certificates(credential_id);
CREATE INDEX IF NOT EXISTS idx_certs_integrity ON certificates(integrity_hash);
CREATE INDEX IF NOT EXISTS idx_certs_replacement ON certificates(original_certificate_id, replacement_certificate_id);

-- 4. Create certificate_audit_logs table
CREATE TABLE IF NOT EXISTS certificate_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID REFERENCES certificates(id) ON DELETE CASCADE,
  certificate_no TEXT NOT NULL,
  event TEXT NOT NULL, -- CERTIFICATE_ELIGIBLE, CERTIFICATE_GENERATED, CERTIFICATE_ISSUED, CERTIFICATE_VIEWED, CERTIFICATE_DOWNLOADED, CERTIFICATE_VERIFIED, CERTIFICATE_REVOKED, CERTIFICATE_REPLACED
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cert_audit_cert_id ON certificate_audit_logs(certificate_id);
CREATE INDEX IF NOT EXISTS idx_cert_audit_no ON certificate_audit_logs(certificate_no);
CREATE INDEX IF NOT EXISTS idx_cert_audit_event ON certificate_audit_logs(event);
CREATE INDEX IF NOT EXISTS idx_cert_audit_created ON certificate_audit_logs(created_at DESC);

-- Enable RLS on audit logs
ALTER TABLE certificate_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "cert_audit_select_auth" ON certificate_audit_logs;
  CREATE POLICY "cert_audit_select_auth" ON certificate_audit_logs
    FOR SELECT USING (auth.role() = 'authenticated');

  DROP POLICY IF EXISTS "cert_audit_insert_auth" ON certificate_audit_logs;
  CREATE POLICY "cert_audit_insert_auth" ON certificate_audit_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
END $$;

-- 5. Seed Official Certificate Template for MC-001
INSERT INTO certificate_templates (
  id,
  template_code,
  template_name,
  version,
  issuer_name,
  issuer_title,
  issuer_organisation,
  signature_name,
  signature_title,
  border_style,
  body_text,
  is_default,
  is_published
) VALUES (
  '90000000-0000-0000-0000-000000000001',
  'MC-001-STANDARD',
  'Startup Ready Malaysia - Certificate of Achievement',
  '1.0',
  'Dr. Ahmad Fadzil',
  'Academic Director & Registrar',
  'Spectrum Malaysia Learning Council',
  'Dr. Ahmad Fadzil',
  'Academic Director & Registrar',
  'royal_gold',
  'This certificate is awarded to {{learner_name}} for successfully completing the Startup Ready Malaysia micro-credential and demonstrating assessed knowledge and practical competency in foundational business startup preparation.',
  TRUE,
  TRUE
) ON CONFLICT (id) DO UPDATE SET
  template_code = EXCLUDED.template_code,
  template_name = EXCLUDED.template_name,
  version = EXCLUDED.version,
  issuer_name = EXCLUDED.issuer_name,
  issuer_title = EXCLUDED.issuer_title,
  issuer_organisation = EXCLUDED.issuer_organisation,
  body_text = EXCLUDED.body_text;

-- 6. Seed MC-001 Course & Micro-Credential in Courses & Credentials tables
-- A. Ensure Category Exists in training_categories
INSERT INTO training_categories (id, code, name, description, icon, is_system)
VALUES (
  'a1000000-0000-0000-0000-000000000001',
  'entrepreneurship',
  'Entrepreneurship & Digital Business',
  'Accredited entrepreneurship, digital venture creation, and startup acceleration programmes.',
  'Briefcase',
  TRUE
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- B. Seed MC-001 Course
INSERT INTO courses (
  id,
  course_code,
  title,
  description,
  category_id,
  category,
  level,
  learning_hours,
  attendance_required_pct,
  min_pass_score,
  status,
  prerequisites
) VALUES (
  'c1000000-0000-0000-0000-000000000001',
  'SPM-LMS-MC-001',
  'Startup Ready Malaysia: From Business Idea to SSM Registration & Launch',
  'A rigorous practical micro-credential preparing Malaysian entrepreneurs to validate business ideas, construct viable financial business models, navigate SSM regulatory compliance, and execute market launch.',
  (SELECT id FROM training_categories WHERE code = 'entrepreneurship' LIMIT 1),
  'Entrepreneurship',
  'Intermediate',
  16.00,
  80.00,
  80.00,
  'published',
  'Basic digital literacy and entrepreneurial interest.'
) ON CONFLICT (course_code) DO UPDATE SET
  title = EXCLUDED.title,
  learning_hours = EXCLUDED.learning_hours,
  min_pass_score = EXCLUDED.min_pass_score;

-- C. Seed MC-001 Modules
INSERT INTO course_modules (id, course_id, title, description, sort_order)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Module 1: Market Validation & Value Proposition', 'Customer problem interviews and value testing in the Malaysian market.', 1),
  ('b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Module 2: Business Model Canvas & Unit Economics', 'Pricing, cost structure, margins, and financial viability modelling.', 2),
  ('b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'Module 3: Legal Compliance & SSM Registration in Malaysia', 'Sole proprietorship, partnership vs Sdn Bhd, EzBiz registration, and licensing.', 3),
  ('b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 'Module 4: Launch Execution & Capstone Submission', 'Digital storefront setup, go-to-market plan, and final portfolio capstone.', 4)
ON CONFLICT (id) DO NOTHING;

-- D. Seed MC-001 Lessons
INSERT INTO course_lessons (id, module_id, title, description, duration_min, sort_order, is_mandatory)
VALUES
  ('b2000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', '1.1 Problem-Solution Fit in Malaysia', 'Identifying validated consumer pain points in urban and rural Malaysia.', 60, 1, TRUE),
  ('b2000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', '1.2 Customer Discovery Practical Task', 'Conducting 5 structured customer discovery interviews.', 90, 2, TRUE),
  ('b2000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', '2.1 Business Model Canvas Masterclass', 'Formulating the 9 building blocks of the Business Model Canvas.', 90, 1, TRUE),
  ('b2000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', '2.2 Unit Economics & Breakeven Modeling', 'Calculating margins, fixed costs, and breakeven sales volumes.', 60, 2, TRUE),
  ('b2000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000003', '3.1 SSM Business Registration Step-by-Step', 'Suruhanjaya Syarikat Malaysia (SSM) EzBiz portal navigation.', 90, 1, TRUE),
  ('b2000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000003', '3.2 Scenario Assessment: Regulatory Compliance', 'Case study scenario resolving commercial licensing requirements.', 60, 2, TRUE),
  ('b2000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000004', '4.1 Final Assessment: Startup Knowledge Examination', 'Comprehensive 20-question final theory exam (80% pass score).', 60, 1, TRUE),
  ('b2000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000004', '4.2 Capstone Project: Startup Launch Portfolio', 'Submission of validated BMC, draft SSM Form A, and Go-to-Market plan.', 120, 2, TRUE)
ON CONFLICT (id) DO NOTHING;

-- E. Seed in Credentials table
INSERT INTO credentials (
  id,
  credential_code,
  name,
  description,
  credential_type,
  level,
  learning_hours,
  version,
  is_active,
  category_id,
  certificate_template_id
) VALUES (
  'd1000000-0000-0000-0000-000000000001',
  'SPM-LMS-MC-001',
  'Startup Ready Malaysia: From Business Idea to SSM Registration & Launch',
  'Assesses and certifies foundational business ideation, financial modeling, Malaysian statutory business registration with SSM, and initial commercial launch.',
  'micro_credential',
  'Level 3 - Intermediate',
  16.00,
  1,
  TRUE,
  (SELECT id FROM training_categories WHERE code = 'entrepreneurship' LIMIT 1),
  '90000000-0000-0000-0000-000000000001'
) ON CONFLICT (credential_code) DO UPDATE SET
  name = EXCLUDED.name,
  learning_hours = EXCLUDED.learning_hours;

-- F. Seed Credential Requirements for MC-001
INSERT INTO credential_requirements (
  id,
  credential_id,
  requirement_type,
  course_id,
  min_score,
  min_attendance_pct,
  description,
  logic_group
) VALUES
  ('bc000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'course_completion', 'c1000000-0000-0000-0000-000000000001', 80, 80, 'Complete all 4 modules and lessons in SPM-LMS-MC-001', 'AND_1'),
  ('bc000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'assessment_pass', 'c1000000-0000-0000-0000-000000000001', 80, NULL, 'Pass Final Assessment Exam with 80% or higher', 'AND_1'),
  ('bc000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'practical_assessment', 'c1000000-0000-0000-0000-000000000001', 80, NULL, 'Pass Startup Launch Portfolio Capstone rubric evaluation', 'AND_1')
ON CONFLICT (id) DO NOTHING;

-- 7. Ensure a Demo Participant & Fully Issued Sample Certificate for MC-001 exists for verification
DO $$
DECLARE
  v_participant_id UUID;
  v_cert_no TEXT := 'SPM-MC001-2026-000001';
  v_snapshot JSONB;
  v_integrity_hash TEXT;
BEGIN
  -- Get or create test participant
  SELECT id INTO v_participant_id FROM participants ORDER BY created_at ASC LIMIT 1;
  
  IF v_participant_id IS NOT NULL THEN
    -- Build immutable snapshot
    v_snapshot := jsonb_build_object(
      'learner_full_name', (SELECT full_name FROM participants WHERE id = v_participant_id),
      'course_title', 'Startup Ready Malaysia: From Business Idea to SSM Registration & Launch',
      'course_code', 'SPM-LMS-MC-001',
      'credential_id', 'd1000000-0000-0000-0000-000000000001',
      'certificate_no', v_cert_no,
      'issue_date', TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD'),
      'completion_date', TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD'),
      'learning_hours', 16,
      'assessment_status', 'Passed with Distinction (92%)',
      'issuer_name', 'Dr. Ahmad Fadzil',
      'issuer_title', 'Academic Director & Registrar',
      'issuer_organisation', 'Spectrum Malaysia Learning Council',
      'template_version', '1.0',
      'skills_acquired', jsonb_build_array('Business Model Validation', 'SSM EzBiz Registration', 'Unit Economics Modeling', 'Go-To-Market Execution')
    );

    v_integrity_hash := md5(v_snapshot::text);

    -- Insert seed certificate
    INSERT INTO certificates (
      id,
      certificate_no,
      participant_id,
      programme_id,
      course_id,
      credential_id,
      template_id,
      issue_date,
      status,
      learning_hours,
      completion_date,
      verification_url,
      integrity_hash,
      snapshot_data,
      qr_data,
      template_version
    ) VALUES (
      'e1000000-0000-0000-0000-000000000001',
      v_cert_no,
      v_participant_id,
      (SELECT id FROM programmes LIMIT 1),
      'c1000000-0000-0000-0000-000000000001',
      'd1000000-0000-0000-0000-000000000001',
      '90000000-0000-0000-0000-000000000001',
      CURRENT_DATE,
      'issued',
      16,
      CURRENT_DATE,
      '/verify/certificate/' || v_cert_no,
      v_integrity_hash,
      v_snapshot,
      '/verify/certificate/' || v_cert_no,
      '1.0'
    ) ON CONFLICT (certificate_no) DO UPDATE SET
      status = 'issued',
      snapshot_data = EXCLUDED.snapshot_data,
      integrity_hash = EXCLUDED.integrity_hash,
      verification_url = EXCLUDED.verification_url;

    -- Audit log
    INSERT INTO certificate_audit_logs (
      certificate_id,
      certificate_no,
      event,
      actor_name,
      metadata
    ) VALUES (
      'e1000000-0000-0000-0000-000000000001',
      v_cert_no,
      'CERTIFICATE_ISSUED',
      'System Automation Engine',
      jsonb_build_object('action', 'initial_issuance', 'credential_code', 'SPM-LMS-MC-001')
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;
