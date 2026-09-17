-- Migration 0015: Allow read on participants and server actions on certificates
DROP POLICY IF EXISTS "participants_read_all" ON participants;
CREATE POLICY "participants_read_all" ON participants FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "certs_system_insert" ON certificates;
CREATE POLICY "certs_system_insert" ON certificates
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "certs_system_update" ON certificates;
CREATE POLICY "certs_system_update" ON certificates
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
