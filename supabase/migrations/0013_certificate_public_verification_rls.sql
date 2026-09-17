-- Migration 0013: RLS Policies for Public Certificate Verification & Learner Access
-- Enables anyone (including unauthenticated QR scanners) to verify valid, revoked, or replaced certificates.

-- 1. Certificates table policies
DROP POLICY IF EXISTS "certs_public_verify" ON certificates;
CREATE POLICY "certs_public_verify" ON certificates
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('issued', 'revoked', 'replaced'));

DROP POLICY IF EXISTS "certs_authenticated_all" ON certificates;
CREATE POLICY "certs_authenticated_all" ON certificates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 2. Certificate templates policies
DROP POLICY IF EXISTS "cert_templates_public_read" ON certificate_templates;
CREATE POLICY "cert_templates_public_read" ON certificate_templates
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "cert_templates_authenticated_manage" ON certificate_templates;
CREATE POLICY "cert_templates_authenticated_manage" ON certificate_templates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Certificate audit logs policies
DROP POLICY IF EXISTS "cert_audit_logs_public_insert" ON certificate_audit_logs;
CREATE POLICY "cert_audit_logs_public_insert" ON certificate_audit_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "cert_audit_logs_authenticated_read" ON certificate_audit_logs;
CREATE POLICY "cert_audit_logs_authenticated_read" ON certificate_audit_logs
  FOR SELECT
  TO authenticated
  USING (true);
