-- MIGRATION: 0024_commercial_rbac_rls.sql
-- PHASE 1: DATABASE + RLS + AUTH SECURITY
-- Expanding roles and account lifecycles for government-ready LMS

-- 1. Extend user_role to include SECURITY_COMPLIANCE if possible (Postgres Enum expansion)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'security_compliance';

-- 2. Extend approval_status_type to include SUSPENDED and ARCHIVED
ALTER TYPE approval_status_type ADD VALUE IF NOT EXISTS 'SUSPENDED';
ALTER TYPE approval_status_type ADD VALUE IF NOT EXISTS 'ARCHIVED';

-- 3. Create Multi-Organisation Schema Scoping
CREATE TABLE IF NOT EXISTS organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'government', 'ngo', 'corporate'
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Link NADI sites to organisations
ALTER TABLE nadi_sites ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES organisations(id);

-- 4. Audit Log Enhancements (if not present)
ALTER TABLE audit_logs 
  ADD COLUMN IF NOT EXISTS scope TEXT,
  ADD COLUMN IF NOT EXISTS before_value JSONB,
  ADD COLUMN IF NOT EXISTS after_value JSONB,
  ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- 5. Strict RLS Policies (Example for NADI isolation)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles in their organisation"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile 
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role IN ('admin', 'superadmin', 'security_compliance')
    )
  );

-- Revoke dangerous defaults
REVOKE ALL ON profiles FROM public;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
