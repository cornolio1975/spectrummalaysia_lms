-- ==============================================================================
-- SPECTRUM MALAYSIA LMS — MIGRATION 0011: CENTRAL AI & N8N AUTOMATION PLATFORM
-- Provider-neutral, free-first AI gateway, usage telemetry, cost controls,
-- Hostinger AI Router settings, and secure n8n automation engine.
-- ==============================================================================

-- 1. AI PROVIDERS REGISTRY
CREATE TABLE IF NOT EXISTS ai_providers (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    TEXT NOT NULL,
  code                    TEXT UNIQUE NOT NULL,
  provider_type           TEXT NOT NULL, -- 'free_local', 'hostinger_router', 'openai', 'gemini', 'anthropic', 'xai', 'simulation'
  endpoint                TEXT,
  api_key_encrypted       TEXT,
  is_enabled              BOOLEAN NOT NULL DEFAULT FALSE,
  is_default              BOOLEAN NOT NULL DEFAULT FALSE,
  priority                INT NOT NULL DEFAULT 1,
  is_free                 BOOLEAN NOT NULL DEFAULT TRUE,
  daily_request_limit     INT NOT NULL DEFAULT 200,
  monthly_request_limit   INT NOT NULL DEFAULT 5000,
  daily_token_limit       INT NOT NULL DEFAULT 200000,
  monthly_token_limit     INT NOT NULL DEFAULT 5000000,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. AI MODELS CATALOG
CREATE TABLE IF NOT EXISTS ai_models (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id             UUID NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
  model_name              TEXT NOT NULL,
  model_code              TEXT NOT NULL,
  capabilities            JSONB NOT NULL DEFAULT '["text", "chat"]'::jsonb,
  context_window          INT NOT NULL DEFAULT 8192,
  max_output_tokens       INT NOT NULL DEFAULT 2048,
  input_token_cost_per_m  NUMERIC(10, 4) NOT NULL DEFAULT 0.0000,
  output_token_cost_per_m NUMERIC(10, 4) NOT NULL DEFAULT 0.0000,
  is_enabled              BOOLEAN NOT NULL DEFAULT TRUE,
  is_default              BOOLEAN NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider_id, model_code)
);

-- 3. AI FEATURE CONFIGURATIONS
CREATE TABLE IF NOT EXISTS ai_feature_settings (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_code            TEXT UNIQUE NOT NULL,
  feature_name            TEXT NOT NULL,
  category                TEXT NOT NULL, -- 'learning', 'trainer', 'assessment', 'learner', 'admin', 'language'
  provider_id             UUID REFERENCES ai_providers(id) ON DELETE SET NULL,
  model_id                UUID REFERENCES ai_models(id) ON DELETE SET NULL,
  fallback_provider_id    UUID REFERENCES ai_providers(id) ON DELETE SET NULL,
  fallback_model_id       UUID REFERENCES ai_models(id) ON DELETE SET NULL,
  system_prompt           TEXT,
  temperature             NUMERIC(3, 2) NOT NULL DEFAULT 0.70,
  max_tokens              INT NOT NULL DEFAULT 1024,
  is_enabled              BOOLEAN NOT NULL DEFAULT TRUE,
  requires_approval       BOOLEAN NOT NULL DEFAULT TRUE,
  allow_external_ai       BOOLEAN NOT NULL DEFAULT FALSE,
  allowed_roles           TEXT[] NOT NULL DEFAULT '{"admin", "super_admin", "trainer", "learner"}'::text[],
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. AI USAGE & TELEMETRY LOGS
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_role               TEXT,
  feature_code            TEXT NOT NULL,
  provider_code           TEXT NOT NULL,
  model_code              TEXT NOT NULL,
  prompt_tokens           INT NOT NULL DEFAULT 0,
  completion_tokens       INT NOT NULL DEFAULT 0,
  total_tokens            INT NOT NULL DEFAULT 0,
  latency_ms              INT NOT NULL DEFAULT 0,
  status                  TEXT NOT NULL, -- 'success', 'fallback_success', 'simulated', 'failed'
  estimated_cost          NUMERIC(10, 6) NOT NULL DEFAULT 0.000000,
  error_message           TEXT,
  request_id              TEXT NOT NULL,
  is_fallback             BOOLEAN NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. AI BUDGETS & COST CONTROLS
CREATE TABLE IF NOT EXISTS ai_budgets (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_month            TEXT NOT NULL UNIQUE, -- YYYY-MM
  max_monthly_budget_usd  NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
  current_spend_usd       NUMERIC(10, 6) NOT NULL DEFAULT 0.000000,
  alert_threshold_pct     INT NOT NULL DEFAULT 80,
  auto_disable_on_limit   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. AI AUDIT LOGS
CREATE TABLE IF NOT EXISTS ai_audit_logs (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id                UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action                  TEXT NOT NULL,
  target_entity           TEXT NOT NULL,
  details                 JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. N8N AUTOMATION INTEGRATIONS
CREATE TABLE IF NOT EXISTS n8n_integrations (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    TEXT NOT NULL DEFAULT 'Hostinger n8n Engine',
  base_url                TEXT NOT NULL DEFAULT 'http://localhost:5678',
  webhook_secret_hash     TEXT,
  api_key_encrypted       TEXT,
  is_enabled              BOOLEAN NOT NULL DEFAULT FALSE,
  last_ping_at            TIMESTAMPTZ,
  status                  TEXT NOT NULL DEFAULT 'configured', -- 'configured', 'online', 'unreachable'
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. N8N ASYNCHRONOUS JOBS QUEUE
CREATE TABLE IF NOT EXISTS n8n_jobs (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id                  TEXT UNIQUE NOT NULL,
  event_type              TEXT NOT NULL,
  status                  TEXT NOT NULL DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed', 'cancelled'
  request_payload         JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_payload          JSONB NOT NULL DEFAULT '{}'::jsonb,
  retry_count             INT NOT NULL DEFAULT 0,
  error_details           TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at            TIMESTAMPTZ
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict read-only enforcement for 'observer' role across all AI tables.
-- Full management for 'admin' and 'super_admin'.
-- ==============================================================================

ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feature_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_jobs ENABLE ROW LEVEL SECURITY;

-- ai_providers: all authenticated users can view, admins can manage, observers read-only
CREATE POLICY "ai_providers_read" ON ai_providers FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "ai_providers_manage" ON ai_providers FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'programme_admin'))
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'programme_admin'))
);

-- ai_models: read for authenticated, manage for admin
CREATE POLICY "ai_models_read" ON ai_models FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "ai_models_manage" ON ai_models FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'programme_admin'))
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'programme_admin'))
);

-- ai_feature_settings: read for authenticated, manage for admin
CREATE POLICY "ai_feature_settings_read" ON ai_feature_settings FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "ai_feature_settings_manage" ON ai_feature_settings FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'programme_admin'))
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'programme_admin'))
);

-- ai_usage_logs: admins view all, users view their own, observers can only SELECT
CREATE POLICY "ai_usage_logs_select" ON ai_usage_logs FOR SELECT TO authenticated USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'programme_admin', 'observer'))
);
CREATE POLICY "ai_usage_logs_insert" ON ai_usage_logs FOR INSERT TO authenticated WITH CHECK (TRUE);

-- ai_budgets: select for admin/observer, manage for admin
CREATE POLICY "ai_budgets_select" ON ai_budgets FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'programme_admin', 'observer'))
);
CREATE POLICY "ai_budgets_manage" ON ai_budgets FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'programme_admin'))
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'programme_admin'))
);

-- n8n_integrations: admin/observer select, admin manage
CREATE POLICY "n8n_integrations_select" ON n8n_integrations FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'programme_admin', 'observer'))
);
CREATE POLICY "n8n_integrations_manage" ON n8n_integrations FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'programme_admin'))
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'programme_admin'))
);

-- n8n_jobs: authenticated can view their jobs or admin/observer all
CREATE POLICY "n8n_jobs_select" ON n8n_jobs FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "n8n_jobs_insert" ON n8n_jobs FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "n8n_jobs_update" ON n8n_jobs FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'programme_admin'))
);

-- ==============================================================================
-- SEED INITIAL PROVIDERS, MODELS, FEATURES & BUDGET
-- Free-First Principle: Simulation & Local Free active; Paid external providers OFF.
-- ==============================================================================

-- 1. Simulation Provider (Default Active, Always Works, Free)
INSERT INTO ai_providers (id, name, code, provider_type, is_enabled, is_default, priority, is_free)
VALUES (
  '11111111-aaaa-4000-8000-000000000001',
  'Spectrum Built-in Simulation Engine',
  'simulation',
  'simulation',
  TRUE,
  TRUE,
  1,
  TRUE
) ON CONFLICT (code) DO NOTHING;

INSERT INTO ai_models (id, provider_id, model_name, model_code, is_enabled, is_default)
VALUES (
  '11111111-bbbb-4000-8000-000000000001',
  '11111111-aaaa-4000-8000-000000000001',
  'Simulation Coach v1 (Zero-Cost)',
  'sim-coach-v1',
  TRUE,
  TRUE
) ON CONFLICT (provider_id, model_code) DO NOTHING;

-- 2. Free / Local Provider (Ollama / Local OpenAI Compatible)
INSERT INTO ai_providers (id, name, code, provider_type, endpoint, is_enabled, is_default, priority, is_free)
VALUES (
  '11111111-aaaa-4000-8000-000000000002',
  'Free Local Inference (Ollama / LocalAI)',
  'free_local',
  'free_local',
  'http://localhost:11434/v1',
  FALSE,
  FALSE,
  2,
  TRUE
) ON CONFLICT (code) DO NOTHING;

INSERT INTO ai_models (id, provider_id, model_name, model_code, is_enabled, is_default)
VALUES (
  '11111111-bbbb-4000-8000-000000000002',
  '11111111-aaaa-4000-8000-000000000002',
  'Llama 3.2 3B (Local)',
  'llama3.2:latest',
  TRUE,
  TRUE
) ON CONFLICT (provider_id, model_code) DO NOTHING;

-- 3. Hostinger AI Router (Ready for configuration)
INSERT INTO ai_providers (id, name, code, provider_type, endpoint, is_enabled, is_default, priority, is_free)
VALUES (
  '11111111-aaaa-4000-8000-000000000003',
  'Hostinger AI Router',
  'hostinger_router',
  'hostinger_router',
  'https://ai-router.hostinger.com/v1',
  FALSE,
  FALSE,
  3,
  FALSE
) ON CONFLICT (code) DO NOTHING;

INSERT INTO ai_models (id, provider_id, model_name, model_code, is_enabled, is_default)
VALUES (
  '11111111-bbbb-4000-8000-000000000003',
  '11111111-aaaa-4000-8000-000000000003',
  'Hostinger Fast Router (Auto-Model)',
  'hostinger-auto',
  TRUE,
  TRUE
) ON CONFLICT (provider_id, model_code) DO NOTHING;

-- 4. External Providers (OFF by default)
INSERT INTO ai_providers (id, name, code, provider_type, endpoint, is_enabled, is_default, priority, is_free)
VALUES
  ('11111111-aaaa-4000-8000-000000000004', 'OpenAI (External)', 'openai', 'openai', 'https://api.openai.com/v1', FALSE, FALSE, 4, FALSE),
  ('11111111-aaaa-4000-8000-000000000005', 'Google Gemini (External)', 'gemini', 'gemini', 'https://generativelanguage.googleapis.com/v1beta', FALSE, FALSE, 5, FALSE),
  ('11111111-aaaa-4000-8000-000000000006', 'Anthropic Claude (External)', 'anthropic', 'anthropic', 'https://api.anthropic.com/v1', FALSE, FALSE, 6, FALSE)
ON CONFLICT (code) DO NOTHING;

-- Seed Initial Core AI Features Matrix
INSERT INTO ai_feature_settings (feature_code, feature_name, category, provider_id, model_id, system_prompt)
VALUES
  (
    'ai_course_builder',
    'AI Course Curriculum Builder',
    'trainer',
    '11111111-aaaa-4000-8000-000000000001',
    '11111111-bbbb-4000-8000-000000000001',
    'You are an expert curriculum designer for Spectrum Malaysia LMS. Generate structured, outcome-based course drafts adhering to national competency benchmarks.'
  ),
  (
    'ai_learner_assistant',
    'AI Learner Study Coach',
    'learner',
    '11111111-aaaa-4000-8000-000000000001',
    '11111111-bbbb-4000-8000-000000000001',
    'You are an empathetic, knowledgeable academic tutor for Malaysian learners. Explain concepts clearly. NEVER solve quiz or exam questions.'
  ),
  (
    'ai_quiz_generator',
    'AI Assessment & Quiz Generator',
    'assessment',
    '11111111-aaaa-4000-8000-000000000001',
    '11111111-bbbb-4000-8000-000000000001',
    'Generate rigorous assessment questions with balanced distractor options and clear explanations.'
  ),
  (
    'ai_report_explainer',
    'AI KPI & Telemetry Explainer',
    'admin',
    '11111111-aaaa-4000-8000-000000000001',
    '11111111-bbbb-4000-8000-000000000001',
    'Synthesize institutional training KPIs into executive insights highlighting participation trends and completion bottlenecks.'
  )
ON CONFLICT (feature_code) DO NOTHING;

-- Seed Default n8n Integration record
INSERT INTO n8n_integrations (id, name, base_url, is_enabled, status)
VALUES (
  '22222222-aaaa-4000-8000-000000000001',
  'Hostinger n8n Orchestrator',
  'https://automation.spectrum.my',
  FALSE,
  'configured'
) ON CONFLICT (id) DO NOTHING;

-- Seed Default Current Month Budget
INSERT INTO ai_budgets (period_month, max_monthly_budget_usd, current_spend_usd, alert_threshold_pct, auto_disable_on_limit)
VALUES (
  TO_CHAR(NOW(), 'YYYY-MM'),
  50.00,
  0.000000,
  80,
  TRUE
) ON CONFLICT (period_month) DO NOTHING;
