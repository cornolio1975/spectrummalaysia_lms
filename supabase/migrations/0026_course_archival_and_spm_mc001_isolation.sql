-- Migration: 0026_course_archival_and_spm_mc001_isolation.sql
-- Description: Implement backward-compatible course archival and visibility controls.
-- Isolate legacy SPM-LMS-MC-001 from active course catalogues, discovery, and new enrolments.

BEGIN;

-- 1. Add explicit archival columns to courses table (backward-compatible)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone DEFAULT null;

-- 2. Add performance index on archival state
CREATE INDEX IF NOT EXISTS idx_courses_is_archived ON courses(is_archived);
CREATE INDEX IF NOT EXISTS idx_courses_status_is_archived ON courses(status, is_archived);

-- 3. Idempotently archive Startup Launch Essentials (SPM-LMS-MC-001)
-- Preserving UUID, all course modules, practical assessments, and 12 issued certificates.
UPDATE courses
SET 
  status = 'archived'::course_status,
  is_archived = true,
  archived_at = COALESCE(archived_at, now())
WHERE course_code = 'SPM-LMS-MC-001';

-- 4. Idempotent helper functions for safe administrative archival / restoration
CREATE OR REPLACE FUNCTION archive_course(p_course_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE courses
  SET 
    status = 'archived'::course_status,
    is_archived = true,
    archived_at = now()
  WHERE course_code = p_course_code;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION unarchive_course(p_course_code text, p_target_status course_status DEFAULT 'draft'::course_status)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE courses
  SET 
    status = p_target_status,
    is_archived = false,
    archived_at = null
  WHERE course_code = p_course_code;
  RETURN FOUND;
END;
$$;

COMMIT;
