-- 1. Enable RLS and apply security policies
ALTER TABLE nadi_sites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nadi_read_all" ON nadi_sites;
CREATE POLICY "nadi_read_all" ON nadi_sites FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "nadi_write_admin" ON nadi_sites;
CREATE POLICY "nadi_write_admin" ON nadi_sites FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));

DROP POLICY IF EXISTS "nadi_write_nadi_admin" ON nadi_sites;
CREATE POLICY "nadi_write_nadi_admin" ON nadi_sites FOR UPDATE USING (
  (SELECT auth_role()) = 'nadi_admin' AND id = (SELECT auth_nadi_id())
);

-- 2. Grant permissions to API roles
GRANT SELECT, INSERT, UPDATE, DELETE ON nadi_sites TO anon, authenticated, service_role;

-- 3. Restore Foreign Key Constraints dropped by CASCADE
ALTER TABLE profiles ADD CONSTRAINT profiles_nadi_id_fkey FOREIGN KEY (nadi_id) REFERENCES nadi_sites(id);
ALTER TABLE participants ADD CONSTRAINT participants_nadi_id_fkey FOREIGN KEY (nadi_id) REFERENCES nadi_sites(id);
ALTER TABLE participant_nadi_assignments ADD CONSTRAINT participant_nadi_assignments_nadi_id_fkey FOREIGN KEY (nadi_id) REFERENCES nadi_sites(id) ON DELETE RESTRICT;
ALTER TABLE events ADD CONSTRAINT events_nadi_id_fkey FOREIGN KEY (nadi_id) REFERENCES nadi_sites(id);
ALTER TABLE media ADD CONSTRAINT media_nadi_id_fkey FOREIGN KEY (nadi_id) REFERENCES nadi_sites(id);
ALTER TABLE kpis ADD CONSTRAINT kpis_nadi_id_fkey FOREIGN KEY (nadi_id) REFERENCES nadi_sites(id);
ALTER TABLE live_classes ADD CONSTRAINT live_classes_nadi_id_fkey FOREIGN KEY (nadi_id) REFERENCES nadi_sites(id) ON DELETE SET NULL;

-- 4. Reload PostgREST API Schema Cache so it detects the new table
NOTIFY pgrst, 'reload schema';
