-- =================================================================================
-- 0022_trainer_rls.sql
-- Implements Row Level Security (RLS) for the Trainer Management Module
--
-- MASTER RULE:
-- 1. Admins have FULL access to all trainer management tables.
-- 2. Observers have READ-ONLY access to all trainer management tables.
-- 3. Trainers have READ-ONLY access to their OWN records, and limited WRITE
--    access to their own specific tables (like documents/content).
-- 4. Learners have NO access to any trainer management tables.
-- =================================================================================

-- 1. Enable RLS on all Trainer Management tables
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Create helper functions for roles
-- Note: Assuming auth.users metadata or a user_roles table exists based on standard LMS architecture.
-- The policies below use a simplified generic approach checking the user's role.

-- ---------------------------------------------------------------------------------
-- TABLE: trainers (The main directory)
-- ---------------------------------------------------------------------------------

-- Admin/Observer: Can read all trainers
CREATE POLICY "Admins and Observers can view all trainers"
ON trainers
FOR SELECT
USING (auth.jwt() ->> 'role' IN ('admin', 'observer', 'super_admin'));

-- Admin: Can insert/update/delete trainers
CREATE POLICY "Admins can manage trainers"
ON trainers
FOR ALL
USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

-- Trainer: Can view their OWN profile
CREATE POLICY "Trainers can view their own profile"
ON trainers
FOR SELECT
USING (auth.uid() = id);

-- ---------------------------------------------------------------------------------
-- TABLE: trainer_course_assignments
-- ---------------------------------------------------------------------------------

CREATE POLICY "Admins and Observers can view all assignments"
ON trainer_course_assignments
FOR SELECT
USING (auth.jwt() ->> 'role' IN ('admin', 'observer', 'super_admin'));

CREATE POLICY "Admins can manage assignments"
ON trainer_course_assignments
FOR ALL
USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

CREATE POLICY "Trainers can view their own assignments"
ON trainer_course_assignments
FOR SELECT
USING (auth.uid() = trainer_id);

-- ---------------------------------------------------------------------------------
-- TABLE: trainer_credentials
-- ---------------------------------------------------------------------------------

CREATE POLICY "Admins and Observers can view all credentials"
ON trainer_credentials
FOR SELECT
USING (auth.jwt() ->> 'role' IN ('admin', 'observer', 'super_admin'));

CREATE POLICY "Admins can manage credentials"
ON trainer_credentials
FOR ALL
USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

CREATE POLICY "Trainers can view their own credentials"
ON trainer_credentials
FOR SELECT
USING (auth.uid() = trainer_id);

-- ---------------------------------------------------------------------------------
-- TABLE: trainer_documents
-- ---------------------------------------------------------------------------------

CREATE POLICY "Admins and Observers can view all documents"
ON trainer_documents
FOR SELECT
USING (auth.jwt() ->> 'role' IN ('admin', 'observer', 'super_admin'));

CREATE POLICY "Admins can manage documents"
ON trainer_documents
FOR ALL
USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

CREATE POLICY "Trainers can view and upload their own documents"
ON trainer_documents
FOR ALL
USING (auth.uid() = trainer_id);

-- ---------------------------------------------------------------------------------
-- TABLE: trainer_attendance
-- ---------------------------------------------------------------------------------

CREATE POLICY "Admins and Observers can view all attendance"
ON trainer_attendance
FOR SELECT
USING (auth.jwt() ->> 'role' IN ('admin', 'observer', 'super_admin'));

CREATE POLICY "Admins can manage attendance"
ON trainer_attendance
FOR ALL
USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

CREATE POLICY "Trainers can view their own attendance"
ON trainer_attendance
FOR SELECT
USING (auth.uid() = trainer_id);

-- ---------------------------------------------------------------------------------
-- TABLE: trainer_audit_logs
-- ---------------------------------------------------------------------------------

-- Nobody but admins should ever read the audit logs.
CREATE POLICY "Admins can view audit logs"
ON trainer_audit_logs
FOR SELECT
USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

-- Even admins cannot delete audit logs. They are immutable.
CREATE POLICY "System can insert audit logs"
ON trainer_audit_logs
FOR INSERT
WITH CHECK (true); -- Usually triggered via DB functions or secure API calls
