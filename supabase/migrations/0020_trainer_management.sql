-- ============================================================
-- 0009_trainer_management.sql
-- ============================================================

-- ============================================================
-- TRAINER DOCUMENTS
-- ============================================================
CREATE TABLE trainer_documents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id          UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  document_type       TEXT NOT NULL, -- e.g., 'ic', 'qualification', 'resume'
  file_name           TEXT NOT NULL,
  file_url            TEXT NOT NULL,
  upload_date         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date         DATE,
  verification_status TEXT NOT NULL DEFAULT 'pending', -- pending, verified, rejected
  verified_by         UUID REFERENCES auth.users(id),
  verification_date   TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_td_trainer ON trainer_documents(trainer_id);
CREATE INDEX idx_td_status ON trainer_documents(verification_status);

-- ============================================================
-- TRAINER CREDENTIALS
-- ============================================================
CREATE TABLE trainer_credentials (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id          UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  credential_name     TEXT NOT NULL,
  credential_type     TEXT,
  issuing_org         TEXT,
  credential_number   TEXT,
  issue_date          DATE,
  expiry_date         DATE,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  supporting_doc_url  TEXT,
  verified_by         UUID REFERENCES auth.users(id),
  verification_date   TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tc_trainer ON trainer_credentials(trainer_id);

-- ============================================================
-- TRAINER NADI ASSIGNMENTS
-- ============================================================
CREATE TABLE trainer_nadi_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id      UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  nadi_id         UUID REFERENCES nadi_sites(id) ON DELETE CASCADE,
  state_id        UUID REFERENCES states(id),
  programme_id    UUID REFERENCES programmes(id),
  is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
  start_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date        DATE,
  status          TEXT NOT NULL DEFAULT 'active',
  assigned_by     UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tna_trainer ON trainer_nadi_assignments(trainer_id);
CREATE INDEX idx_tna_nadi ON trainer_nadi_assignments(nadi_id);

-- ============================================================
-- TRAINER COURSE ASSIGNMENTS
-- ============================================================
CREATE TABLE trainer_course_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id      UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  programme_id    UUID REFERENCES programmes(id) ON DELETE CASCADE, -- using programmes as "courses" in this schema
  module_id       UUID REFERENCES programme_modules(id) ON DELETE CASCADE,
  lesson_id       UUID REFERENCES lessons(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'Lead Trainer', -- Lead, Co-Trainer, Facilitator, Assessor, Moderator
  nadi_id         UUID REFERENCES nadi_sites(id),
  start_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date        DATE,
  status          TEXT NOT NULL DEFAULT 'active',
  assigned_by     UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tca_trainer ON trainer_course_assignments(trainer_id);
CREATE INDEX idx_tca_programme ON trainer_course_assignments(programme_id);

-- ============================================================
-- TRAINER ATTENDANCE
-- ============================================================
CREATE TABLE trainer_attendance (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id      UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  event_id        UUID REFERENCES events(id) ON DELETE CASCADE,
  session_id      UUID REFERENCES event_sessions(id) ON DELETE CASCADE,
  nadi_id         UUID REFERENCES nadi_sites(id),
  attendance_date DATE NOT NULL,
  start_time      TIME,
  end_time        TIME,
  status          TEXT NOT NULL DEFAULT 'Present', -- Present, Late, Absent, Excused
  check_in_time   TIMESTAMPTZ,
  check_out_time  TIMESTAMPTZ,
  remarks         TEXT,
  recorded_by     UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ta_trainer ON trainer_attendance(trainer_id);
CREATE INDEX idx_ta_session ON trainer_attendance(session_id);

-- ============================================================
-- TRAINER PERMISSIONS
-- ============================================================
CREATE TABLE trainer_permissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id      UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  permission_key  TEXT NOT NULL,
  is_granted      BOOLEAN NOT NULL DEFAULT TRUE,
  granted_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(trainer_id, permission_key)
);

CREATE INDEX idx_tp_trainer ON trainer_permissions(trainer_id);

-- ============================================================
-- TRAINER AUDIT LOGS
-- ============================================================
CREATE TABLE trainer_audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id), -- the person making the change
  trainer_id      UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  action          TEXT NOT NULL,
  previous_value  JSONB,
  new_value       JSONB,
  ip_address      INET,
  user_agent      TEXT,
  related_record  TEXT, -- optional reference like 'trainer_course_assignments:1234'
  reason          TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tal_trainer ON trainer_audit_logs(trainer_id);
CREATE INDEX idx_tal_date ON trainer_audit_logs(created_at DESC);

-- ============================================================
-- ENABLE RLS
-- ============================================================
ALTER TABLE trainer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_nadi_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_audit_logs ENABLE ROW LEVEL SECURITY;

-- Base read policies for admins and the trainer themselves
CREATE POLICY "trainers_data_read" ON trainer_documents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "trainers_data_read_cred" ON trainer_credentials FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "trainers_data_read_nadi" ON trainer_nadi_assignments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "trainers_data_read_course" ON trainer_course_assignments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "trainers_data_read_att" ON trainer_attendance FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "trainers_data_read_perm" ON trainer_permissions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "trainers_data_read_audit" ON trainer_audit_logs FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admin write policies
CREATE POLICY "trainers_data_write_admin" ON trainer_documents FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));
CREATE POLICY "trainers_data_write_admin_cred" ON trainer_credentials FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));
CREATE POLICY "trainers_data_write_admin_nadi" ON trainer_nadi_assignments FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));
CREATE POLICY "trainers_data_write_admin_course" ON trainer_course_assignments FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));
CREATE POLICY "trainers_data_write_admin_att" ON trainer_attendance FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));
CREATE POLICY "trainers_data_write_admin_perm" ON trainer_permissions FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));
CREATE POLICY "trainers_data_write_admin_audit" ON trainer_audit_logs FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));

-- Apply updated_at trigger
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'trainer_documents', 'trainer_credentials', 'trainer_nadi_assignments', 
    'trainer_course_assignments', 'trainer_attendance', 'trainer_permissions'
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
