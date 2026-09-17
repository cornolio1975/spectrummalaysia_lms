-- ============================================================
-- Spectrum Malaysia LMS — Master Seed 0010
-- Initial Courses, Skills, Competencies, Micro-Credentials,
-- Certificate Templates, and Practical Tasks
-- ============================================================

-- 1. Initial Skills & Competencies
INSERT INTO skills (skill_code, name, description, level_standard) VALUES
  ('SKL-AI-01', 'Generative AI Fundamentals', 'Understanding foundational LLMs, prompt engineering, and GenAI ethics', 'Foundational'),
  ('SKL-AI-02', 'AI Workflow Automation', 'Integrating AI tools into productivity workflows and business operations', 'Intermediate'),
  ('SKL-DIG-01', 'Cloud Collaboration & Workspace Tools', 'Using modern cloud document, spreadsheet, and communication suites', 'Foundational'),
  ('SKL-BIZ-01', 'Digital Business Models & E-Commerce', 'Setting up omnichannel retail, payment gateways, and inventory', 'Intermediate'),
  ('SKL-OSH-01', 'Hazard Identification & Risk Assessment (HIRARC)', 'Systematic workplace safety assessment and risk mitigation', 'Intermediate')
ON CONFLICT (skill_code) DO NOTHING;

-- Competencies linked to skills
INSERT INTO competencies (skill_id, competency_code, title, description, performance_criteria)
SELECT 
  s.id,
  'COMP-AI-001',
  'Craft Context-Aware Prompts',
  'Demonstrates ability to write structured prompts achieving accurate model outputs',
  '["Uses zero-shot and few-shot techniques", "Specifies explicit guardrails and output format", "Validates accuracy"]'::jsonb
FROM skills s WHERE s.skill_code = 'SKL-AI-01'
ON CONFLICT (competency_code) DO NOTHING;

INSERT INTO competencies (skill_id, competency_code, title, description, performance_criteria)
SELECT 
  s.id,
  'COMP-BIZ-001',
  'Deploy Digital Payment Gateway',
  'Integrates and tests a live or sandbox payment gateway complying with Malaysian banking norms',
  '["Configures DuitNow / FPX gateway", "Executes test transactions", "Reconciles settlement reports"]'::jsonb
FROM skills s WHERE s.skill_code = 'SKL-BIZ-01'
ON CONFLICT (competency_code) DO NOTHING;

-- 2. Certificate Templates
INSERT INTO certificate_templates (id, template_name, issuer_name, is_default, template_html, template_css)
VALUES (
  '50000000-0000-0000-0000-000000000001',
  'Standard Spectrum Malaysia Certificate',
  'Spectrum Malaysia LMS',
  true,
  '<div class="cert-body"><h2>{{credential_name}}</h2><p>{{learner_name}}</p><p>{{credential_id}}</p></div>',
  '.cert-body { text-align: center; }'
) ON CONFLICT (id) DO UPDATE SET is_default = true;

-- 3. Initial Credentials (Micro-Credentials & Certificates)
INSERT INTO credentials (
  id,
  credential_code,
  name,
  description,
  credential_type,
  level,
  learning_hours,
  version,
  approval_workflow,
  expiry_months,
  certificate_template_id,
  badge_config,
  is_active
) VALUES 
(
  '60000000-0000-0000-0000-000000000001',
  'MC-AI-GENAI-01',
  'Certified GenAI Practitioner for Malaysian Enterprise',
  'Recognizes practical mastery in applying generative AI tools, prompt workflows, and ethical considerations for enterprise operations.',
  'micro_credential',
  'Level 3 - Intermediate',
  16.00,
  1,
  'automatic',
  24,
  '50000000-0000-0000-0000-000000000001',
  '{"color": "#0ea5e9", "icon": "Cpu", "shape": "hexagon", "tag": "AI Specialist"}'::jsonb,
  true
),
(
  '60000000-0000-0000-0000-000000000002',
  'MC-DIG-BIZ-01',
  'Digital Commerce & E-Commerce Operations Specialist',
  'Demonstrates competency in setting up, launching, and managing digital storefronts, payment integrations, and marketing funnels.',
  'micro_credential',
  'Level 3 - Intermediate',
  20.00,
  1,
  'trainer_approval',
  36,
  '50000000-0000-0000-0000-000000000001',
  '{"color": "#10b981", "icon": "ShoppingBag", "shape": "circle", "tag": "Commerce"}'::jsonb,
  true
),
(
  '60000000-0000-0000-0000-000000000003',
  'CERT-COMP-PROG',
  'Spectrum Malaysia Programme Completion Certificate',
  'Official certification of successful participation and milestone completion in Spectrum Malaysia learning initiatives.',
  'certificate_of_completion',
  'Level 2 - Foundational',
  10.00,
  1,
  'automatic',
  0,
  '50000000-0000-0000-0000-000000000001',
  '{"color": "#6366f1", "icon": "Award", "shape": "shield", "tag": "Completion"}'::jsonb,
  true
)
ON CONFLICT (credential_code) DO NOTHING;

-- 4. Initial Courses
INSERT INTO courses (
  id,
  course_code,
  title,
  description,
  category,
  level,
  learning_hours,
  status,
  learning_objectives,
  learning_outcomes,
  attendance_required_pct,
  min_pass_score
) VALUES 
(
  '70000000-0000-0000-0000-000000000001',
  'CRS-2026-0001',
  'Applied Generative AI: From Prompting to Automated Workflows',
  'A hands-on, practice-oriented course on using GenAI tools, building autonomous prompt templates, and adhering to Malaysian data privacy and copyright principles.',
  'Artificial Intelligence & GenAI',
  'Intermediate',
  16.00,
  'published',
  '["Master advanced multi-turn prompt engineering", "Evaluate GenAI safety and data governance", "Build practical automated productivity pipelines"]'::jsonb,
  '["Ability to produce reliable context-aware prompts", "Competency in automated workflow deployment", "Knowledge of Malaysian OSH & digital guidelines"]'::jsonb,
  80.00,
  70.00
),
(
  '70000000-0000-0000-0000-000000000002',
  'CRS-2026-0002',
  'Digital Commerce Transformation for SME & Micro-Entrepreneurs',
  'Practical step-by-step masterclass in launching e-commerce portals, connecting DuitNow payment gateways, and scaling social media advertising.',
  'Entrepreneurship & Business',
  'Intermediate',
  20.00,
  'published',
  '["Design an online product catalog", "Configure domestic payment methods (FPX / DuitNow)", "Execute a localized social marketing campaign"]'::jsonb,
  '["Live store setup completed", "Payment gateway integration verified", "Sales funnel tracking operational"]'::jsonb,
  75.00,
  70.00
)
ON CONFLICT (course_code) DO NOTHING;

-- Modules for CRS-2026-0001
INSERT INTO course_modules (id, course_id, title, description, sort_order)
VALUES 
  ('71000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'Module 1: Foundations of Prompt Engineering', 'Learn the mechanics of large language models and prompt design.', 1),
  ('71000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001', 'Module 2: Practical Automation Workflows', 'Connecting AI outputs with spreadsheets, reports, and communication tools.', 2),
  ('71000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000001', 'Module 3: Practical Assessment & Capstone Submission', 'Hands-on practical evaluation and rubric-graded submission.', 3)
ON CONFLICT (id) DO NOTHING;

-- Lessons for Module 1
INSERT INTO course_lessons (id, module_id, title, description, duration_min, is_mandatory, sort_order)
VALUES 
  ('72000000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000001', 'Lesson 1.1: Core Architecture of LLMs', 'Understanding tokens, context windows, and hallucination risks.', 45, true, 1),
  ('72000000-0000-0000-0000-000000000002', '71000000-0000-0000-0000-000000000001', 'Lesson 1.2: Advanced Few-Shot Prompt Patterns', 'Designing persona, task, context, and format rules.', 60, true, 2),
  ('72000000-0000-0000-0000-000000000003', '71000000-0000-0000-0000-000000000002', 'Lesson 2.1: Connecting AI to Document Pipelines', 'Automating meeting minutes, executive summaries, and multi-language translation.', 75, true, 3)
ON CONFLICT (id) DO NOTHING;

-- Lesson contents
INSERT INTO course_contents (lesson_id, title, content_type, content_body, is_required, sort_order)
VALUES 
  (
    '72000000-0000-0000-0000-000000000001',
    'Introduction to Modern Generative AI',
    'text',
    '<h3>Welcome to Applied Generative AI</h3><p>Generative Artificial Intelligence represents a paradigm shift in how digital knowledge is created, synthesized, and deployed in Malaysia. In this lesson, we explore how transformer architectures process natural language, how temperature affects randomness, and how to verify output accuracy.</p>',
    true,
    1
  ),
  (
    '72000000-0000-0000-0000-000000000002',
    'The 4-Part Prompt Formula (Persona, Context, Task, Format)',
    'text',
    '<div class="prompt-box"><p><strong>1. Persona:</strong> Define who the AI is acting as.</p><p><strong>2. Context:</strong> Provide background data and constraints.</p><p><strong>3. Task:</strong> Explicit action verb and scope.</p><p><strong>4. Format:</strong> Table, Markdown, JSON, or formal report.</p></div>',
    true,
    1
  )
ON CONFLICT DO NOTHING;

-- 5. Practical Assessment for CRS-2026-0001
INSERT INTO practical_assessments (
  id,
  course_id,
  title,
  instructions,
  required_evidence_types,
  rubrics,
  max_score,
  pass_mark
) VALUES (
  '73000000-0000-0000-0000-000000000001',
  '70000000-0000-0000-0000-000000000001',
  'Capstone Practical: Enterprise Prompt Template & Automated Output Verification',
  'Develop a production-ready prompt template for a real Malaysian business or academic scenario. Include your test prompts, input variations, verified outputs, and a 1-page PDF or video reflection on hallucination safeguards.',
  ARRAY['document', 'photo', 'video'],
  '[
    {"criterion": "Prompt Clarity & Structure", "max_points": 30, "description": "Uses explicit persona, instructions, and formatting constraints."},
    {"criterion": "Hallucination Mitigation", "max_points": 30, "description": "Demonstrates boundary constraints and fact-checking protocols."},
    {"criterion": "Practical Value & Evidence", "max_points": 40, "description": "Submission includes working test artifacts and documentation."}
  ]'::jsonb,
  100.00,
  70.00
) ON CONFLICT (id) DO NOTHING;

-- 6. Link Credential Requirements for MC-AI-GENAI-01
INSERT INTO credential_requirements (
  credential_id,
  requirement_type,
  course_id,
  min_score,
  min_attendance_pct,
  logic_group,
  is_mandatory,
  description
) VALUES 
(
  '60000000-0000-0000-0000-000000000001',
  'course_completion',
  '70000000-0000-0000-0000-000000000001',
  NULL,
  80.00,
  'AND_1',
  true,
  'Complete 100% of required lessons in Applied Generative AI course'
),
(
  '60000000-0000-0000-0000-000000000001',
  'practical_assessment',
  '70000000-0000-0000-0000-000000000001',
  70.00,
  NULL,
  'AND_1',
  true,
  'Pass Capstone Practical Assessment with score of 70% or higher'
)
ON CONFLICT DO NOTHING;
