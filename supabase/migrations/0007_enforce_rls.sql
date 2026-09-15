-- ============================================================
-- SpectrumMY LMS — Enforce Row Level Security (RLS)
-- Migration 0007
-- ============================================================

-- ─── 1. OPTIMIZE HELPER FUNCTIONS ──────────────────────────────────────────

-- Get current user's role
CREATE OR REPLACE FUNCTION auth_role()
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT role FROM public.profiles WHERE id = (SELECT auth.uid());
$$;

-- Get current user's state_id
CREATE OR REPLACE FUNCTION auth_state_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT state_id FROM public.profiles WHERE id = (SELECT auth.uid());
$$;

-- Get current user's nadi_id
CREATE OR REPLACE FUNCTION auth_nadi_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT nadi_id FROM public.profiles WHERE id = (SELECT auth.uid());
$$;


-- ─── 2. ENABLE RLS ON ALL TABLES ───────────────────────────────────────────
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE nadi_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_nadi_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- From live_classes (Migration 0005)
ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_class_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_class_join_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_google_accounts ENABLE ROW LEVEL SECURITY;


-- ─── 3. DROP OLD/EXISTING POLICIES (TO AVOID CONFLICTS) ────────────────────
DO $$ 
DECLARE 
  r RECORD;
BEGIN 
  FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') 
  LOOP 
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.' || r.tablename; 
  END LOOP; 
END $$;


-- ─── 4. APPLY OPTIMIZED POLICIES ───────────────────────────────────────────

-- Helper definition for "Any logged in user can read"
-- USING (auth.uid() IS NOT NULL)

-- ================= GLOBAL CONFIGURATION =================

-- states
DROP POLICY IF EXISTS "states_read_all" ON states;
CREATE POLICY "states_read_all" ON states FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "states_write_admin" ON states;
CREATE POLICY "states_write_admin" ON states FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));

-- nadi_sites
DROP POLICY IF EXISTS "nadi_read_all" ON nadi_sites;
CREATE POLICY "nadi_read_all" ON nadi_sites FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "nadi_write_admin" ON nadi_sites;
CREATE POLICY "nadi_write_admin" ON nadi_sites FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));
DROP POLICY IF EXISTS "nadi_write_nadi_admin" ON nadi_sites;
CREATE POLICY "nadi_write_nadi_admin" ON nadi_sites FOR UPDATE USING (
  (SELECT auth_role()) = 'nadi_admin' AND id = (SELECT auth_nadi_id())
);

-- profiles
DROP POLICY IF EXISTS "profiles_read_all" ON profiles;
CREATE POLICY "profiles_read_all" ON profiles FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "profiles_write_admin" ON profiles;
CREATE POLICY "profiles_write_admin" ON profiles FOR ALL USING ((SELECT auth_role()) = 'super_admin');

-- system_settings
DROP POLICY IF EXISTS "settings_read_all" ON system_settings;
CREATE POLICY "settings_read_all" ON system_settings FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "settings_write_super" ON system_settings;
CREATE POLICY "settings_write_super" ON system_settings FOR ALL USING ((SELECT auth_role()) = 'super_admin');


-- ================= CORE LMS CONTENT =================

-- programmes
DROP POLICY IF EXISTS "programmes_read_all" ON programmes;
CREATE POLICY "programmes_read_all" ON programmes FOR SELECT USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);
DROP POLICY IF EXISTS "programmes_write_admin" ON programmes;
CREATE POLICY "programmes_write_admin" ON programmes FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));

-- programme_modules, lessons, lesson_contents
DROP POLICY IF EXISTS "modules_read_all" ON programme_modules;
CREATE POLICY "modules_read_all" ON programme_modules FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "modules_write_admin" ON programme_modules;
CREATE POLICY "modules_write_admin" ON programme_modules FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));

DROP POLICY IF EXISTS "lessons_read_all" ON lessons;
CREATE POLICY "lessons_read_all" ON lessons FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "lessons_write_admin" ON lessons;
CREATE POLICY "lessons_write_admin" ON lessons FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));

DROP POLICY IF EXISTS "contents_read_all" ON lesson_contents;
CREATE POLICY "contents_read_all" ON lesson_contents FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "contents_write_admin" ON lesson_contents;
CREATE POLICY "contents_write_admin" ON lesson_contents FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));

-- quizzes & assessments content
DROP POLICY IF EXISTS "quizzes_read_all" ON quizzes;
CREATE POLICY "quizzes_read_all" ON quizzes FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "quizzes_write_admin" ON quizzes;
CREATE POLICY "quizzes_write_admin" ON quizzes FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));

DROP POLICY IF EXISTS "quiz_questions_read_all" ON quiz_questions;
CREATE POLICY "quiz_questions_read_all" ON quiz_questions FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "quiz_questions_write_admin" ON quiz_questions;
CREATE POLICY "quiz_questions_write_admin" ON quiz_questions FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));

DROP POLICY IF EXISTS "assessments_read_all" ON assessments;
CREATE POLICY "assessments_read_all" ON assessments FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "assessments_write_admin" ON assessments;
CREATE POLICY "assessments_write_admin" ON assessments FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));


-- ================= USERS AND OPERATIONS =================

-- participants
DROP POLICY IF EXISTS "participants_read_all" ON participants;
CREATE POLICY "participants_read_all" ON participants FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "participants_write_admin" ON participants;
CREATE POLICY "participants_write_admin" ON participants FOR ALL USING (
  (SELECT auth_role()) IN ('super_admin', 'programme_admin', 'registrar')
);
DROP POLICY IF EXISTS "participants_write_nadi_admin" ON participants;
CREATE POLICY "participants_write_nadi_admin" ON participants FOR UPDATE USING (
  (SELECT auth_role()) = 'nadi_admin' AND
  EXISTS (
    SELECT 1 FROM participant_nadi_assignments pna 
    WHERE pna.participant_id = participants.id 
    AND pna.nadi_id = (SELECT auth_nadi_id())
  )
);
DROP POLICY IF EXISTS "participants_write_state_admin" ON participants;
CREATE POLICY "participants_write_state_admin" ON participants FOR UPDATE USING (
  (SELECT auth_role()) = 'state_admin' AND
  EXISTS (
    SELECT 1 FROM participant_nadi_assignments pna 
    JOIN nadi_sites ns ON ns.id = pna.nadi_id
    WHERE pna.participant_id = participants.id 
    AND ns.state_id = (SELECT auth_state_id())
  )
);

-- trainers
DROP POLICY IF EXISTS "trainers_read_all" ON trainers;
CREATE POLICY "trainers_read_all" ON trainers FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "trainers_write_admin" ON trainers;
CREATE POLICY "trainers_write_admin" ON trainers FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));
DROP POLICY IF EXISTS "trainers_update_own" ON trainers;
CREATE POLICY "trainers_update_own" ON trainers FOR UPDATE USING (profile_id = (SELECT auth.uid()));

-- events
DROP POLICY IF EXISTS "events_read_all" ON events;
CREATE POLICY "events_read_all" ON events FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "events_write_admin" ON events;
CREATE POLICY "events_write_admin" ON events FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));
DROP POLICY IF EXISTS "events_write_nadi_admin" ON events;
CREATE POLICY "events_write_nadi_admin" ON events FOR ALL USING (
  (SELECT auth_role()) = 'nadi_admin' AND nadi_id = (SELECT auth_nadi_id())
);

-- event_sessions
DROP POLICY IF EXISTS "sessions_read_all" ON event_sessions;
CREATE POLICY "sessions_read_all" ON event_sessions FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "sessions_write_admin" ON event_sessions;
CREATE POLICY "sessions_write_admin" ON event_sessions FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));
DROP POLICY IF EXISTS "sessions_write_nadi_admin" ON event_sessions;
CREATE POLICY "sessions_write_nadi_admin" ON event_sessions FOR ALL USING (
  (SELECT auth_role()) = 'nadi_admin' AND 
  EXISTS (SELECT 1 FROM events e WHERE e.id = event_sessions.event_id AND e.nadi_id = (SELECT auth_nadi_id()))
);
DROP POLICY IF EXISTS "sessions_write_trainer" ON event_sessions;
CREATE POLICY "sessions_write_trainer" ON event_sessions FOR UPDATE USING (
  (SELECT auth_role()) = 'trainer' AND 
  trainer_id = (SELECT id FROM trainers WHERE profile_id = (SELECT auth.uid()))
);

-- attendance
DROP POLICY IF EXISTS "attendance_read_all" ON attendance;
CREATE POLICY "attendance_read_all" ON attendance FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "attendance_write_admin" ON attendance;
CREATE POLICY "attendance_write_admin" ON attendance FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));
DROP POLICY IF EXISTS "attendance_write_nadi_admin" ON attendance;
CREATE POLICY "attendance_write_nadi_admin" ON attendance FOR ALL USING (
  (SELECT auth_role()) = 'nadi_admin' AND 
  EXISTS (
    SELECT 1 FROM event_sessions es 
    JOIN events e ON e.id = es.event_id 
    WHERE es.id = attendance.session_id AND e.nadi_id = (SELECT auth_nadi_id())
  )
);
DROP POLICY IF EXISTS "attendance_write_trainer" ON attendance;
CREATE POLICY "attendance_write_trainer" ON attendance FOR ALL USING (
  (SELECT auth_role()) = 'trainer' AND 
  EXISTS (
    SELECT 1 FROM event_sessions es 
    WHERE es.id = attendance.session_id 
    AND es.trainer_id = (SELECT id FROM trainers WHERE profile_id = (SELECT auth.uid()))
  )
);

-- live_classes
DROP POLICY IF EXISTS "live_classes_read_all" ON live_classes;
CREATE POLICY "live_classes_read_all" ON live_classes FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "live_classes_write_admin" ON live_classes;
CREATE POLICY "live_classes_write_admin" ON live_classes FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));
DROP POLICY IF EXISTS "live_classes_write_trainer" ON live_classes;
CREATE POLICY "live_classes_write_trainer" ON live_classes FOR ALL USING (
  (SELECT auth_role()) = 'trainer' AND trainer_id = (SELECT id FROM trainers WHERE profile_id = (SELECT auth.uid()))
);
DROP POLICY IF EXISTS "live_classes_write_nadi_admin" ON live_classes;
CREATE POLICY "live_classes_write_nadi_admin" ON live_classes FOR ALL USING (
  (SELECT auth_role()) = 'nadi_admin' AND nadi_id = (SELECT auth_nadi_id())
);

-- trainer_google_accounts
DROP POLICY IF EXISTS "trainer_google_read_all" ON trainer_google_accounts;
CREATE POLICY "trainer_google_read_all" ON trainer_google_accounts FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "trainer_google_write_own" ON trainer_google_accounts;
CREATE POLICY "trainer_google_write_own" ON trainer_google_accounts FOR ALL USING (
  trainer_id = (SELECT id FROM trainers WHERE profile_id = (SELECT auth.uid()))
);
DROP POLICY IF EXISTS "trainer_google_write_admin" ON trainer_google_accounts;
CREATE POLICY "trainer_google_write_admin" ON trainer_google_accounts FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));


-- ================= ASSESSMENTS AND METRICS =================

-- Reports & KPIs (Admins only for write)
DROP POLICY IF EXISTS "reports_read_all" ON reports;
CREATE POLICY "reports_read_all" ON reports FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "reports_write_admin" ON reports;
CREATE POLICY "reports_write_admin" ON reports FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));

DROP POLICY IF EXISTS "kpis_read_all" ON kpis;
CREATE POLICY "kpis_read_all" ON kpis FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "kpis_write_super" ON kpis;
CREATE POLICY "kpis_write_super" ON kpis FOR ALL USING ((SELECT auth_role()) = 'super_admin');

DROP POLICY IF EXISTS "kpi_targets_read_all" ON kpi_targets;
CREATE POLICY "kpi_targets_read_all" ON kpi_targets FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "kpi_targets_write_super" ON kpi_targets;
CREATE POLICY "kpi_targets_write_super" ON kpi_targets FOR ALL USING ((SELECT auth_role()) = 'super_admin');

DROP POLICY IF EXISTS "kpi_results_read_all" ON kpi_results;
CREATE POLICY "kpi_results_read_all" ON kpi_results FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "kpi_results_write_admin" ON kpi_results;
CREATE POLICY "kpi_results_write_admin" ON kpi_results FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin', 'state_admin', 'nadi_admin'));

-- User progress and attempts (Read all, write admins/system)
DROP POLICY IF EXISTS "progress_read_all" ON learning_progress;
CREATE POLICY "progress_read_all" ON learning_progress FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "progress_write_admin" ON learning_progress;
CREATE POLICY "progress_write_admin" ON learning_progress FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));

DROP POLICY IF EXISTS "quiz_attempts_read_all" ON quiz_attempts;
CREATE POLICY "quiz_attempts_read_all" ON quiz_attempts FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "quiz_attempts_write_admin" ON quiz_attempts;
CREATE POLICY "quiz_attempts_write_admin" ON quiz_attempts FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));

DROP POLICY IF EXISTS "quiz_answers_read_all" ON quiz_answers;
CREATE POLICY "quiz_answers_read_all" ON quiz_answers FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "quiz_answers_write_admin" ON quiz_answers;
CREATE POLICY "quiz_answers_write_admin" ON quiz_answers FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));

DROP POLICY IF EXISTS "assessment_results_read_all" ON assessment_results;
CREATE POLICY "assessment_results_read_all" ON assessment_results FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "assessment_results_write_admin" ON assessment_results;
CREATE POLICY "assessment_results_write_admin" ON assessment_results FOR ALL USING ((SELECT auth_role()) IN ('super_admin', 'programme_admin'));

-- ================= DEFAULT FALLBACK FOR ALL OTHER TABLES =================
-- (For any tables left without specific granular policies, enable read-only for authenticated, write for super_admin)
-- E.g. audit_logs, certificate_templates, certificates, media, participant_programmes, etc.

DO $$ 
DECLARE 
  t text;
BEGIN
  FOR t IN (
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT IN (
      'states', 'nadi_sites', 'profiles', 'system_settings', 'programmes', 'programme_modules', 
      'lessons', 'lesson_contents', 'quizzes', 'quiz_questions', 'assessments', 'participants', 
      'trainers', 'events', 'event_sessions', 'attendance', 'live_classes', 'trainer_google_accounts',
      'reports', 'kpis', 'kpi_targets', 'kpi_results', 'learning_progress', 'quiz_attempts',
      'quiz_answers', 'assessment_results'
    )
  ) 
  LOOP 
    EXECUTE 'DROP POLICY IF EXISTS "default_read_all" ON ' || quote_ident(t);
    EXECUTE 'CREATE POLICY "default_read_all" ON ' || quote_ident(t) || ' FOR SELECT USING (auth.uid() IS NOT NULL)';
    EXECUTE 'DROP POLICY IF EXISTS "default_write_super" ON ' || quote_ident(t);
    EXECUTE 'CREATE POLICY "default_write_super" ON ' || quote_ident(t) || ' FOR ALL USING ((SELECT auth_role()) = ''super_admin'')';
  END LOOP; 
END $$;
