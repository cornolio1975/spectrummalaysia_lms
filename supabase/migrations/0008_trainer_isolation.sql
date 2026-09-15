-- ============================================================
-- SpectrumMY Programme & Learning Management System
-- Migration 0008: Trainer Isolation & Content Management
-- ============================================================

-- ============================================================
-- 1. ENUMS
-- ============================================================

CREATE TYPE content_review_status AS ENUM ('draft', 'pending_review', 'under_review', 'approved', 'rejected');

-- ============================================================
-- 2. NEW TABLES
-- ============================================================

-- TRAINER WORKSPACES
CREATE TABLE trainer_workspaces (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id       UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  workspace_name   TEXT NOT NULL,
  total_storage_mb DECIMAL(10,2) DEFAULT 0,
  max_storage_mb   DECIMAL(10,2) DEFAULT 5000, -- 5GB default
  status           TEXT NOT NULL DEFAULT 'active',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(trainer_id)
);

CREATE INDEX idx_workspace_trainer ON trainer_workspaces(trainer_id);

-- CONTENT AUDIT LOGS (Specific for trainer content operations)
CREATE TABLE content_audit_logs (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID REFERENCES auth.users(id),
  trainer_id           UUID REFERENCES trainers(id),
  trainer_workspace_id UUID REFERENCES trainer_workspaces(id),
  action               TEXT NOT NULL, -- upload, edit, delete, publish, submit_for_review, etc.
  resource_type        TEXT NOT NULL, -- course, module, lesson, material, video, file
  resource_id          UUID NOT NULL,
  old_values           JSONB,
  new_values           JSONB,
  ip_address           INET,
  notes                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_audit_workspace ON content_audit_logs(trainer_workspace_id);
CREATE INDEX idx_content_audit_resource ON content_audit_logs(resource_id);

-- CONTENT REVIEWS (Approval Workflow)
CREATE TABLE content_reviews (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type        TEXT NOT NULL, -- 'programme', 'lesson_content'
  resource_id          UUID NOT NULL,
  trainer_id           UUID REFERENCES trainers(id),
  trainer_workspace_id UUID REFERENCES trainer_workspaces(id),
  status               content_review_status NOT NULL DEFAULT 'pending_review',
  submitted_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by          UUID REFERENCES auth.users(id),
  reviewed_at          TIMESTAMPTZ,
  reviewer_notes       TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_reviews_resource ON content_reviews(resource_type, resource_id);

-- ============================================================
-- 3. ALTER EXISTING TABLES
-- ============================================================

-- Add workspace ownership and review status to programmes
ALTER TABLE programmes 
  ADD COLUMN trainer_id UUID REFERENCES trainers(id),
  ADD COLUMN trainer_workspace_id UUID REFERENCES trainer_workspaces(id),
  ADD COLUMN review_status content_review_status NOT NULL DEFAULT 'draft';

CREATE INDEX idx_programmes_workspace ON programmes(trainer_workspace_id);

-- Add workspace ownership to programme_modules
ALTER TABLE programme_modules 
  ADD COLUMN trainer_id UUID REFERENCES trainers(id),
  ADD COLUMN trainer_workspace_id UUID REFERENCES trainer_workspaces(id);

CREATE INDEX idx_modules_workspace ON programme_modules(trainer_workspace_id);

-- Add workspace ownership to lessons
ALTER TABLE lessons 
  ADD COLUMN trainer_id UUID REFERENCES trainers(id),
  ADD COLUMN trainer_workspace_id UUID REFERENCES trainer_workspaces(id);

CREATE INDEX idx_lessons_workspace ON lessons(trainer_workspace_id);

-- Add workspace ownership and versioning to lesson_contents (learning materials)
ALTER TABLE lesson_contents 
  ADD COLUMN trainer_id UUID REFERENCES trainers(id),
  ADD COLUMN trainer_workspace_id UUID REFERENCES trainer_workspaces(id),
  ADD COLUMN storage_path TEXT,
  ADD COLUMN version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN previous_version_id UUID REFERENCES lesson_contents(id);

CREATE INDEX idx_contents_workspace ON lesson_contents(trainer_workspace_id);

-- Add workspace ownership to media
ALTER TABLE media 
  ADD COLUMN trainer_workspace_id UUID REFERENCES trainer_workspaces(id);

CREATE INDEX idx_media_workspace ON media(trainer_workspace_id);

-- ============================================================
-- 4. TRIGGERS
-- ============================================================

-- Apply updated_at triggers
CREATE OR REPLACE TRIGGER set_updated_at_trainer_workspaces
  BEFORE UPDATE ON trainer_workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_content_reviews
  BEFORE UPDATE ON content_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create workspace for trainer when they are created
CREATE OR REPLACE FUNCTION handle_new_trainer_workspace()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO trainer_workspaces (trainer_id, workspace_name)
  VALUES (NEW.id, NEW.name || '''s Workspace');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_trainer_created_create_workspace
  AFTER INSERT ON trainers
  FOR EACH ROW EXECUTE FUNCTION handle_new_trainer_workspace();

-- ============================================================
-- 5. STORAGE BUCKETS & POLICIES
-- ============================================================

-- Note: In Supabase, creating buckets via SQL is done by inserting into storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trainer_content',
  'trainer_content',
  false, -- NOT PUBLIC, requires signed URLs or authorization headers
  5242880000, -- 5GB overall limit, adjust as necessary
  null -- Allows all standard types; validate at the application level
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Ensure trainers can only access their own workspace folder
-- Format: trainer_content/{trainer_workspace_id}/...

-- Allow trainers to upload to their own workspace folder
CREATE POLICY "Trainers can upload to their workspace"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'trainer_content' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM trainer_workspaces tw
    JOIN trainers t ON tw.trainer_id = t.id
    WHERE t.created_by = auth.uid() OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('super_admin', 'programme_admin'))
  )
);

-- Allow trainers to read from their own workspace folder
CREATE POLICY "Trainers can read their workspace"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'trainer_content' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM trainer_workspaces tw
      JOIN trainers t ON tw.trainer_id = t.id
      WHERE t.created_by = auth.uid()
    )
    OR
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('super_admin', 'programme_admin'))
  )
);

-- Allow trainers to update/delete in their own workspace folder
CREATE POLICY "Trainers can update their workspace files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'trainer_content' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM trainer_workspaces tw
    JOIN trainers t ON tw.trainer_id = t.id
    WHERE t.created_by = auth.uid() OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('super_admin', 'programme_admin'))
  )
);

CREATE POLICY "Trainers can delete their workspace files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'trainer_content' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM trainer_workspaces tw
    JOIN trainers t ON tw.trainer_id = t.id
    WHERE t.created_by = auth.uid() OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('super_admin', 'programme_admin'))
  )
);

-- Public Read for assigned participants (requires application-level signed URLs for truly secure access)
-- Or an edge function that serves the file after checking participant enrolment.
-- We will rely on Signed URLs generated by the backend for published content.

-- ============================================================
-- 6. STRICT ROW LEVEL SECURITY (RLS) FOR ISOLATION
-- ============================================================

ALTER TABLE trainer_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reviews    ENABLE ROW LEVEL SECURITY;

-- Helper to get authenticated user's trainer IDs
CREATE OR REPLACE FUNCTION auth_trainer_ids()
RETURNS TABLE (trainer_id UUID, workspace_id UUID) LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT t.id, tw.id 
  FROM trainers t
  JOIN trainer_workspaces tw ON tw.trainer_id = t.id
  WHERE t.created_by = auth.uid();
$$;

-- TRAINER WORKSPACES
CREATE POLICY "workspace_read_own" ON trainer_workspaces FOR SELECT
  USING (id IN (SELECT workspace_id FROM auth_trainer_ids()) OR auth_role() IN ('super_admin', 'programme_admin'));

CREATE POLICY "workspace_update_own" ON trainer_workspaces FOR UPDATE
  USING (id IN (SELECT workspace_id FROM auth_trainer_ids()) OR auth_role() IN ('super_admin', 'programme_admin'));

-- AUDIT LOGS
CREATE POLICY "content_audit_read" ON content_audit_logs FOR SELECT
  USING (trainer_workspace_id IN (SELECT workspace_id FROM auth_trainer_ids()) OR auth_role() IN ('super_admin', 'programme_admin'));

CREATE POLICY "content_audit_insert" ON content_audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- CONTENT REVIEWS
CREATE POLICY "content_review_read" ON content_reviews FOR SELECT
  USING (trainer_workspace_id IN (SELECT workspace_id FROM auth_trainer_ids()) OR auth_role() IN ('super_admin', 'programme_admin'));

CREATE POLICY "content_review_insert" ON content_reviews FOR INSERT
  WITH CHECK (trainer_workspace_id IN (SELECT workspace_id FROM auth_trainer_ids()) OR auth_role() IN ('super_admin', 'programme_admin'));

CREATE POLICY "content_review_update_admin" ON content_reviews FOR UPDATE
  USING (auth_role() IN ('super_admin', 'programme_admin'));


-- OVERRIDING EXISTING LMS POLICIES TO ENFORCE TRAINER ISOLATION
-- (Dropping old policies that were too permissive and creating strictly isolated ones)

-- PROGRAMMES
DROP POLICY IF EXISTS "programmes_read_all" ON programmes;
DROP POLICY IF EXISTS "programmes_write_admin" ON programmes;

CREATE POLICY "programmes_read_isolated" ON programmes FOR SELECT
  USING (
    -- Admins can see everything
    auth_role() IN ('super_admin', 'programme_admin') OR
    -- Trainers can see their own
    (trainer_workspace_id IN (SELECT workspace_id FROM auth_trainer_ids())) OR
    -- Anyone can see published & approved (Participants rely on this)
    (status = 'published' AND review_status = 'approved' AND deleted_at IS NULL)
  );

CREATE POLICY "programmes_insert_trainer" ON programmes FOR INSERT
  WITH CHECK (
    auth_role() IN ('super_admin', 'programme_admin') OR
    trainer_workspace_id IN (SELECT workspace_id FROM auth_trainer_ids())
  );

CREATE POLICY "programmes_update_trainer" ON programmes FOR UPDATE
  USING (
    auth_role() IN ('super_admin', 'programme_admin') OR
    trainer_workspace_id IN (SELECT workspace_id FROM auth_trainer_ids())
  );

CREATE POLICY "programmes_delete_trainer" ON programmes FOR DELETE
  USING (
    auth_role() IN ('super_admin', 'programme_admin') OR
    trainer_workspace_id IN (SELECT workspace_id FROM auth_trainer_ids())
  );

-- PROGRAMME MODULES
DROP POLICY IF EXISTS "modules_read_all" ON programme_modules;
DROP POLICY IF EXISTS "modules_write_admin" ON programme_modules;

CREATE POLICY "modules_read_isolated" ON programme_modules FOR SELECT
  USING (
    auth_role() IN ('super_admin', 'programme_admin') OR
    trainer_workspace_id IN (SELECT workspace_id FROM auth_trainer_ids()) OR
    -- Public fallback relying on parent programme's visibility
    (trainer_workspace_id IS NULL)
  );

CREATE POLICY "modules_insert_trainer" ON programme_modules FOR INSERT
  WITH CHECK (auth_role() IN ('super_admin', 'programme_admin') OR trainer_workspace_id IN (SELECT workspace_id FROM auth_trainer_ids()));

CREATE POLICY "modules_update_trainer" ON programme_modules FOR UPDATE
  USING (auth_role() IN ('super_admin', 'programme_admin') OR trainer_workspace_id IN (SELECT workspace_id FROM auth_trainer_ids()));

CREATE POLICY "modules_delete_trainer" ON programme_modules FOR DELETE
  USING (auth_role() IN ('super_admin', 'programme_admin') OR trainer_workspace_id IN (SELECT workspace_id FROM auth_trainer_ids()));

-- LESSONS
DROP POLICY IF EXISTS "lessons_read_all" ON lessons;
DROP POLICY IF EXISTS "lessons_write_admin" ON lessons;

CREATE POLICY "lessons_read_isolated" ON lessons FOR SELECT
  USING (
    auth_role() IN ('super_admin', 'programme_admin') OR
    trainer_workspace_id IN (SELECT workspace_id FROM auth_trainer_ids()) OR
    (trainer_workspace_id IS NULL)
  );

CREATE POLICY "lessons_insert_trainer" ON lessons FOR INSERT
  WITH CHECK (auth_role() IN ('super_admin', 'programme_admin') OR trainer_workspace_id IN (SELECT workspace_id FROM auth_trainer_ids()));

CREATE POLICY "lessons_update_trainer" ON lessons FOR UPDATE
  USING (auth_role() IN ('super_admin', 'programme_admin') OR trainer_workspace_id IN (SELECT workspace_id FROM auth_trainer_ids()));

CREATE POLICY "lessons_delete_trainer" ON lessons FOR DELETE
  USING (auth_role() IN ('super_admin', 'programme_admin') OR trainer_workspace_id IN (SELECT workspace_id FROM auth_trainer_ids()));

-- LESSON CONTENTS
DROP POLICY IF EXISTS "content_read_all" ON lesson_contents;
DROP POLICY IF EXISTS "content_write_admin" ON lesson_contents;

CREATE POLICY "content_read_isolated" ON lesson_contents FOR SELECT
  USING (
    auth_role() IN ('super_admin', 'programme_admin') OR
    trainer_workspace_id IN (SELECT workspace_id FROM auth_trainer_ids()) OR
    (trainer_workspace_id IS NULL)
  );

CREATE POLICY "content_insert_trainer" ON lesson_contents FOR INSERT
  WITH CHECK (auth_role() IN ('super_admin', 'programme_admin') OR trainer_workspace_id IN (SELECT workspace_id FROM auth_trainer_ids()));

CREATE POLICY "content_update_trainer" ON lesson_contents FOR UPDATE
  USING (auth_role() IN ('super_admin', 'programme_admin') OR trainer_workspace_id IN (SELECT workspace_id FROM auth_trainer_ids()));

CREATE POLICY "content_delete_trainer" ON lesson_contents FOR DELETE
  USING (auth_role() IN ('super_admin', 'programme_admin') OR trainer_workspace_id IN (SELECT workspace_id FROM auth_trainer_ids()));
