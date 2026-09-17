-- Migration 0014: Allow anon and authenticated SELECT on certificate_audit_logs
DROP POLICY IF EXISTS "cert_audit_logs_authenticated_read" ON certificate_audit_logs;
DROP POLICY IF EXISTS "cert_audit_logs_read_all" ON certificate_audit_logs;
CREATE POLICY "cert_audit_logs_read_all" ON certificate_audit_logs
  FOR SELECT
  TO anon, authenticated
  USING (true);
