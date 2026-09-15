-- ============================================================
-- SpectrumMY LMS — Demo Seed Data
-- Run AFTER 0001_initial_schema.sql
-- ============================================================

-- ─── STATES (All 16 Malaysia States) ──────────────────────────────────────

INSERT INTO states (id, state_code, state_name) VALUES
  ('10000000-0000-0000-0000-000000000001', 'JHR', 'Johor'),
  ('10000000-0000-0000-0000-000000000002', 'KDH', 'Kedah'),
  ('10000000-0000-0000-0000-000000000003', 'KTN', 'Kelantan'),
  ('10000000-0000-0000-0000-000000000004', 'MLK', 'Melaka'),
  ('10000000-0000-0000-0000-000000000005', 'NSN', 'Negeri Sembilan'),
  ('10000000-0000-0000-0000-000000000006', 'PHG', 'Pahang'),
  ('10000000-0000-0000-0000-000000000007', 'PNG', 'Pulau Pinang'),
  ('10000000-0000-0000-0000-000000000008', 'PRK', 'Perak'),
  ('10000000-0000-0000-0000-000000000009', 'PLS', 'Perlis'),
  ('10000000-0000-0000-0000-000000000010', 'SGR', 'Selangor'),
  ('10000000-0000-0000-0000-000000000011', 'TRG', 'Terengganu'),
  ('10000000-0000-0000-0000-000000000012', 'SBH', 'Sabah'),
  ('10000000-0000-0000-0000-000000000013', 'SWK', 'Sarawak'),
  ('10000000-0000-0000-0000-000000000014', 'KUL', 'Kuala Lumpur'),
  ('10000000-0000-0000-0000-000000000015', 'LBN', 'Labuan'),
  ('10000000-0000-0000-0000-000000000016', 'PTJ', 'Putrajaya');

-- ─── NADI SITES (20 sites across various states) ──────────────────────────

INSERT INTO nadi_sites (id, nadi_code, nadi_name, state_id, address, district, postcode, contact_person, contact_phone, contact_email) VALUES
  ('20000000-0000-0000-0000-000000000001', 'NADI-SGR-001', 'NADI Petaling Jaya',         '10000000-0000-0000-0000-000000000010', 'No. 1 Jalan PJ Utama, Petaling Jaya', 'Petaling', '47810', 'Nor Azlin binti Hassan',    '+60 3-7950 1234', 'nadi.pj@spectrummy.gov.my'),
  ('20000000-0000-0000-0000-000000000002', 'NADI-SGR-002', 'NADI Shah Alam',             '10000000-0000-0000-0000-000000000010', 'No. 5 Persiaran PKNS, Shah Alam',    'Petaling', '40150', 'Ahmad Fauzi bin Ismail',    '+60 3-5510 2345', 'nadi.sha@spectrummy.gov.my'),
  ('20000000-0000-0000-0000-000000000003', 'NADI-SGR-003', 'NADI Klang',                 '10000000-0000-0000-0000-000000000010', 'Jalan Meru, Klang',                  'Klang',    '41050', 'Rosnah binti Abdul Razak',  '+60 3-3371 3456', 'nadi.klang@spectrummy.gov.my'),
  ('20000000-0000-0000-0000-000000000004', 'NADI-JHR-001', 'NADI Johor Bahru',           '10000000-0000-0000-0000-000000000001', 'No. 10 Jalan Stulang, Johor Bahru', 'Johor Bahru', '80300', 'Mohd Hafiz bin Othman',  '+60 7-226 4567', 'nadi.jb@spectrummy.gov.my'),
  ('20000000-0000-0000-0000-000000000005', 'NADI-JHR-002', 'NADI Batu Pahat',            '10000000-0000-0000-0000-000000000001', 'Jalan Kluang, Batu Pahat',           'Batu Pahat','83000', 'Siti Nurhaliza binti Zain', '+60 7-431 5678', 'nadi.bp@spectrummy.gov.my'),
  ('20000000-0000-0000-0000-000000000006', 'NADI-PNG-001', 'NADI Georgetown',            '10000000-0000-0000-0000-000000000007', 'No. 3 Jalan Magazine, Georgetown',  'Timur Laut','10300', 'Lee Mei Ling',             '+60 4-261 6789', 'nadi.gt@spectrummy.gov.my'),
  ('20000000-0000-0000-0000-000000000007', 'NADI-PNG-002', 'NADI Bukit Mertajam',        '10000000-0000-0000-0000-000000000007', 'Jalan Kulim, Bukit Mertajam',       'Seberang Perai','14000','Tan Ah Kow',            '+60 4-530 7890', 'nadi.bm@spectrummy.gov.my'),
  ('20000000-0000-0000-0000-000000000008', 'NADI-PRK-001', 'NADI Ipoh',                  '10000000-0000-0000-0000-000000000008', 'No. 20 Jalan Raja, Ipoh',           'Kinta',    '30000', 'Rajan a/l Krishnan',        '+60 5-241 8901', 'nadi.ipoh@spectrummy.gov.my'),
  ('20000000-0000-0000-0000-000000000009', 'NADI-SBH-001', 'NADI Kota Kinabalu',         '10000000-0000-0000-0000-000000000012', 'Jalan Tuaran, Kota Kinabalu',       'Kota Belud','88450', 'Baharudin bin Mohamad',    '+60 88-421 9012', 'nadi.kk@spectrummy.gov.my'),
  ('20000000-0000-0000-0000-000000000010', 'NADI-SBH-002', 'NADI Sandakan',              '10000000-0000-0000-0000-000000000012', 'Jalan Dua, Sandakan',               'Sandakan', '90000', 'Junaidi bin Sulang',        '+60 89-213 0123', 'nadi.sdk@spectrummy.gov.my'),
  ('20000000-0000-0000-0000-000000000011', 'NADI-SWK-001', 'NADI Kuching',               '10000000-0000-0000-0000-000000000013', 'Jalan Datuk Abang, Kuching',        'Kuching',  '93450', 'Florence Anak Jinggut',     '+60 82-231 1234', 'nadi.kch@spectrummy.gov.my'),
  ('20000000-0000-0000-0000-000000000012', 'NADI-SWK-002', 'NADI Miri',                  '10000000-0000-0000-0000-000000000013', 'Jalan Melayu, Miri',                'Miri',     '98000', 'Peter Bing Tong',           '+60 85-412 2345', 'nadi.miri@spectrummy.gov.my'),
  ('20000000-0000-0000-0000-000000000013', 'NADI-KTN-001', 'NADI Kota Bharu',            '10000000-0000-0000-0000-000000000003', 'Jalan Hamzah, Kota Bharu',          'Kota Bharu','15050','Zulaikha binti Yusof',     '+60 9-744 3456', 'nadi.kb@spectrummy.gov.my'),
  ('20000000-0000-0000-0000-000000000014', 'NADI-TRG-001', 'NADI Kuala Terengganu',      '10000000-0000-0000-0000-000000000011', 'Jalan Sultan Ismail, Kuala Terengganu','Kuala Terengganu','20200','Wan Nor Atiqah','+60 9-623 4567', 'nadi.kt@spectrummy.gov.my'),
  ('20000000-0000-0000-0000-000000000015', 'NADI-MLK-001', 'NADI Melaka Tengah',         '10000000-0000-0000-0000-000000000004', 'Jalan Munshi Abdullah, Melaka',     'Melaka Tengah','75100','Cheah Boon Lim',        '+60 6-282 5678', 'nadi.mlk@spectrummy.gov.my'),
  ('20000000-0000-0000-0000-000000000016', 'NADI-NSN-001', 'NADI Seremban',              '10000000-0000-0000-0000-000000000005', 'Jalan Sungai Ujong, Seremban',      'Seremban', '70200', 'Krishnamurthy a/l Pillai',  '+60 6-763 6789', 'nadi.srb@spectrummy.gov.my'),
  ('20000000-0000-0000-0000-000000000017', 'NADI-PHG-001', 'NADI Kuantan',               '10000000-0000-0000-0000-000000000006', 'Jalan Teluk Sisek, Kuantan',        'Kuantan',  '25000', 'Norhasliza binti Mahmud',   '+60 9-513 7890', 'nadi.kuantan@spectrummy.gov.my'),
  ('20000000-0000-0000-0000-000000000018', 'NADI-KDH-001', 'NADI Alor Setar',            '10000000-0000-0000-0000-000000000002', 'Jalan Pekan Melayu, Alor Setar',    'Kota Setar','05050','Anisah binti Abdullah',    '+60 4-731 8901', 'nadi.as@spectrummy.gov.my'),
  ('20000000-0000-0000-0000-000000000019', 'NADI-SGR-004', 'NADI Subang Jaya',           '10000000-0000-0000-0000-000000000010', 'SS 15, Subang Jaya',                'Petaling', '47500', 'Lim Swee Keng',             '+60 3-5636 9012', 'nadi.subang@spectrummy.gov.my'),
  ('20000000-0000-0000-0000-000000000020', 'NADI-KUL-001', 'NADI Kuala Lumpur Pusat',    '10000000-0000-0000-0000-000000000014', 'Jalan Raja Laut, Kuala Lumpur',     'KL Pusat', '50350', 'Muhd Fadhilah bin Zulkifli','+60 3-2690 0123', 'nadi.klc@spectrummy.gov.my');

-- ─── TRAINERS ──────────────────────────────────────────────────────────────

INSERT INTO trainers (id, name, email, phone, specialization, organization, status) VALUES
  ('30000000-0000-0000-0000-000000000001', 'Dr. Azman bin Ibrahim',       'azman.ibrahim@spectrummy.gov.my',  '+60 12-301 2345', 'Digital Education & LMS',  'SpectrumMY Training Division', 'active'),
  ('30000000-0000-0000-0000-000000000002', 'Puan Siti Rohani binti Yusuf','siti.rohani@spectrummy.gov.my',    '+60 12-302 3456', 'STEM Education',            'SpectrumMY Training Division', 'active'),
  ('30000000-0000-0000-0000-000000000003', 'Encik Rizal bin Ramli',       'rizal.ramli@spectrummy.gov.my',    '+60 12-303 4567', 'Entrepreneurship & SME',   'SpectrumMY Training Division', 'active'),
  ('30000000-0000-0000-0000-000000000004', 'Dr. Lim Chee Wai',           'lim.cheewai@spectrummy.gov.my',    '+60 12-304 5678', 'Artificial Intelligence',  'SpectrumMY Training Division', 'active'),
  ('30000000-0000-0000-0000-000000000005', 'Puan Fauziah binti Mohd Noor','fauziah.noor@spectrummy.gov.my',   '+60 12-305 6789', 'Digital Marketing',        'SpectrumMY Training Division', 'active');

-- ─── PROGRAMMES ────────────────────────────────────────────────────────────

INSERT INTO programmes (id, programme_code, programme_name, description, category, target_age_group, target_gender, status, certificate_enabled, completion_percentage_required) VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    'PROG-EKELAS-P',
    'eKelas Pelajar',
    'A comprehensive digital learning programme designed for Malaysian school students, covering core academic subjects enhanced with AI-powered tools and critical thinking skills.',
    'Education',
    '13-17',
    'all',
    'active',
    TRUE,
    80.00
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    'PROG-EKELAS-U',
    'eKelas Usahawan',
    'An entrepreneurship programme leveraging digital tools and design thinking to empower aspiring Malaysian entrepreneurs, particularly youth and women.',
    'Entrepreneurship',
    '18-39',
    'all',
    'active',
    TRUE,
    75.00
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    'PROG-AIWIRA',
    'AI WIRA',
    'A flagship artificial intelligence awareness and skills programme designed to build AI literacy among Malaysians at NADI community centres.',
    'Technology',
    '13-40',
    'all',
    'active',
    TRUE,
    70.00
  );

-- ─── PROGRAMME MODULES — eKelas Pelajar ───────────────────────────────────

INSERT INTO programme_modules (id, programme_id, title, description, sort_order, status) VALUES
  ('50000000-0000-0000-0001-000000000001', '40000000-0000-0000-0000-000000000001', 'Module 1 — eKelas Portal',                   'Core academic subjects delivered through the eKelas digital portal', 1, 'published'),
  ('50000000-0000-0000-0001-000000000002', '40000000-0000-0000-0000-000000000001', 'Module 2 — GenAI for Education',              'Understanding and applying Generative AI in academic contexts',     2, 'published'),
  ('50000000-0000-0000-0001-000000000003', '40000000-0000-0000-0000-000000000001', 'Module 3 — Problem Solving & Critical Thinking','Design thinking and problem-solving methodologies for students',   3, 'published');

-- Module 1 Lessons
INSERT INTO lessons (id, module_id, title, sort_order, duration_min, is_mandatory, status) VALUES
  ('60000000-0000-0001-0001-000000000001', '50000000-0000-0000-0001-000000000001', 'Bahasa Melayu',   1, 60, TRUE, 'published'),
  ('60000000-0000-0001-0001-000000000002', '50000000-0000-0000-0001-000000000001', 'English',         2, 60, TRUE, 'published'),
  ('60000000-0000-0001-0001-000000000003', '50000000-0000-0000-0001-000000000001', 'Mathematics',     3, 60, TRUE, 'published'),
  ('60000000-0000-0001-0001-000000000004', '50000000-0000-0000-0001-000000000001', 'Sciences',        4, 60, TRUE, 'published'),
  ('60000000-0000-0001-0001-000000000005', '50000000-0000-0000-0001-000000000001', 'History',         5, 45, TRUE, 'published'),
  ('60000000-0000-0001-0001-000000000006', '50000000-0000-0000-0001-000000000001', 'Physics',         6, 60, FALSE, 'published'),
  ('60000000-0000-0001-0001-000000000007', '50000000-0000-0000-0001-000000000001', 'Biology',         7, 60, FALSE, 'published'),
  ('60000000-0000-0001-0001-000000000008', '50000000-0000-0000-0001-000000000001', 'Chemistry',       8, 60, FALSE, 'published');

-- Module 2 Lessons
INSERT INTO lessons (id, module_id, title, sort_order, duration_min, is_mandatory, status) VALUES
  ('60000000-0000-0001-0002-000000000001', '50000000-0000-0000-0001-000000000002', 'Introduction to GenAI',             1, 45, TRUE, 'published'),
  ('60000000-0000-0001-0002-000000000002', '50000000-0000-0000-0001-000000000002', 'GenAI Ethics',                      2, 30, TRUE, 'published'),
  ('60000000-0000-0001-0002-000000000003', '50000000-0000-0000-0001-000000000002', 'Prompt Engineering',                3, 60, TRUE, 'published'),
  ('60000000-0000-0001-0002-000000000004', '50000000-0000-0000-0001-000000000002', 'GenAI for Academics',               4, 45, TRUE, 'published'),
  ('60000000-0000-0001-0002-000000000005', '50000000-0000-0000-0001-000000000002', 'GenAI for Soft Skills Development', 5, 30, FALSE, 'published'),
  ('60000000-0000-0001-0002-000000000006', '50000000-0000-0000-0001-000000000002', 'GenAI for Creativity',              6, 30, FALSE, 'published');

-- Module 3 Lessons
INSERT INTO lessons (id, module_id, title, sort_order, duration_min, is_mandatory, status) VALUES
  ('60000000-0000-0001-0003-000000000001', '50000000-0000-0000-0001-000000000003', 'Introduction to Design Thinking',             1, 45, TRUE, 'published'),
  ('60000000-0000-0001-0003-000000000002', '50000000-0000-0000-0001-000000000003', 'Empathise with the User',                     2, 30, TRUE, 'published'),
  ('60000000-0000-0001-0003-000000000003', '50000000-0000-0000-0001-000000000003', 'Define the Problem and Identify the Root Cause',3, 45, TRUE, 'published'),
  ('60000000-0000-0001-0003-000000000004', '50000000-0000-0000-0001-000000000003', 'Ideate and Assess Potential Solutions',        4, 45, TRUE, 'published'),
  ('60000000-0000-0001-0003-000000000005', '50000000-0000-0000-0001-000000000003', 'Prototype Using GenAI',                       5, 60, TRUE, 'published'),
  ('60000000-0000-0001-0003-000000000006', '50000000-0000-0000-0001-000000000003', 'Test and Refine Prototypes',                  6, 45, TRUE, 'published');

-- ─── PROGRAMME MODULES — eKelas Usahawan ──────────────────────────────────

INSERT INTO programme_modules (id, programme_id, title, description, sort_order, status) VALUES
  ('50000000-0000-0000-0002-000000000001', '40000000-0000-0000-0000-000000000002', 'Module 1 — Design Bootcamp',     'Entrepreneurship and design thinking fundamentals',                1, 'published'),
  ('50000000-0000-0000-0002-000000000002', '40000000-0000-0000-0000-000000000002', 'Module 2 — Digital Marketing',   'Building and managing a digital marketing presence for business', 2, 'published');

-- Design Bootcamp Lessons
INSERT INTO lessons (id, module_id, title, sort_order, duration_min, is_mandatory, status) VALUES
  ('60000000-0000-0002-0001-000000000001', '50000000-0000-0000-0002-000000000001', 'Design Thinking',                    1, 60, TRUE, 'published'),
  ('60000000-0000-0002-0001-000000000002', '50000000-0000-0000-0002-000000000001', 'Finding Inspiration',                2, 45, TRUE, 'published'),
  ('60000000-0000-0002-0001-000000000003', '50000000-0000-0000-0002-000000000001', 'Outlining Challenges',               3, 45, TRUE, 'published'),
  ('60000000-0000-0002-0001-000000000004', '50000000-0000-0000-0002-000000000001', 'Developing Ideas',                   4, 60, TRUE, 'published'),
  ('60000000-0000-0002-0001-000000000005', '50000000-0000-0000-0002-000000000001', 'Rapid Prototyping',                  5, 60, TRUE, 'published'),
  ('60000000-0000-0002-0001-000000000006', '50000000-0000-0000-0002-000000000001', 'Business Model Canvassing',          6, 60, TRUE, 'published'),
  ('60000000-0000-0002-0001-000000000007', '50000000-0000-0000-0002-000000000001', 'Exploring and Validating Customers', 7, 45, TRUE, 'published'),
  ('60000000-0000-0002-0001-000000000008', '50000000-0000-0000-0002-000000000001', 'Pitching',                           8, 60, TRUE, 'published');

-- Digital Marketing Lessons
INSERT INTO lessons (id, module_id, title, sort_order, duration_min, is_mandatory, status) VALUES
  ('60000000-0000-0002-0002-000000000001', '50000000-0000-0000-0002-000000000002', 'Digital Marketing Strategy',         1, 60, TRUE, 'published'),
  ('60000000-0000-0002-0002-000000000002', '50000000-0000-0000-0002-000000000002', 'Visual Communications Fundamentals', 2, 45, TRUE, 'published'),
  ('60000000-0000-0002-0002-000000000003', '50000000-0000-0000-0002-000000000002', 'GenAI for Content Creation',         3, 60, TRUE, 'published'),
  ('60000000-0000-0002-0002-000000000004', '50000000-0000-0000-0002-000000000002', 'Managing Digital Marketing',         4, 45, TRUE, 'published');

-- ─── PROGRAMME MODULES — AI WIRA ──────────────────────────────────────────

INSERT INTO programme_modules (id, programme_id, title, description, sort_order, status) VALUES
  ('50000000-0000-0000-0003-000000000001', '40000000-0000-0000-0000-000000000003', 'Module 1 — AI Fundamentals',      'Introduction to Artificial Intelligence concepts and applications', 1, 'published'),
  ('50000000-0000-0000-0003-000000000002', '40000000-0000-0000-0000-000000000003', 'Module 2 — AI in Daily Life',     'Practical AI applications in everyday Malaysian life',              2, 'published'),
  ('50000000-0000-0000-0003-000000000003', '40000000-0000-0000-0000-000000000003', 'Module 3 — AI for Community',     'Using AI tools to solve community problems',                        3, 'published');

-- AI WIRA Lessons (mock/demo content)
INSERT INTO lessons (id, module_id, title, sort_order, duration_min, is_mandatory, status) VALUES
  ('60000000-0000-0003-0001-000000000001', '50000000-0000-0000-0003-000000000001', 'What is Artificial Intelligence?',  1, 45, TRUE, 'published'),
  ('60000000-0000-0003-0001-000000000002', '50000000-0000-0000-0003-000000000001', 'How AI Works: Machine Learning',    2, 60, TRUE, 'published'),
  ('60000000-0000-0003-0001-000000000003', '50000000-0000-0000-0003-000000000001', 'AI Tools You Already Use',          3, 30, TRUE, 'published'),
  ('60000000-0000-0003-0001-000000000004', '50000000-0000-0000-0003-000000000001', 'AI Safety and Ethics',              4, 30, TRUE, 'published'),
  ('60000000-0000-0003-0002-000000000001', '50000000-0000-0000-0003-000000000002', 'AI in Healthcare',                  1, 45, TRUE, 'published'),
  ('60000000-0000-0003-0002-000000000002', '50000000-0000-0000-0003-000000000002', 'AI in Agriculture',                 2, 45, TRUE, 'published'),
  ('60000000-0000-0003-0002-000000000003', '50000000-0000-0000-0003-000000000002', 'AI in Education',                   3, 45, TRUE, 'published'),
  ('60000000-0000-0003-0003-000000000001', '50000000-0000-0000-0003-000000000003', 'Identifying Community Problems',    1, 60, TRUE, 'published'),
  ('60000000-0000-0003-0003-000000000002', '50000000-0000-0000-0003-000000000003', 'AI-Powered Solutions Workshop',     2, 90, TRUE, 'published'),
  ('60000000-0000-0003-0003-000000000003', '50000000-0000-0000-0003-000000000003', 'Presentation & Community Demo',     3, 60, TRUE, 'published');

-- ─── EVENTS (Sample events) ────────────────────────────────────────────────

INSERT INTO events (id, event_code, event_name, programme_id, state_id, nadi_id, event_type, venue, event_date, start_time, end_time, trainer_id, capacity, target_participants, actual_participants, status, description) VALUES
  ('70000000-0000-0000-0000-000000000001', 'EVT20260801-0001', 'eKelas Pelajar — Sesi Agustus PJ',     '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000001', 'Training', 'NADI Petaling Jaya, Dewan Utama', '2026-08-05', '09:00', '17:00', '30000000-0000-0000-0000-000000000001', 40, 35, 32, 'completed', 'eKelas Pelajar intensive session covering Module 1 and 2'),
  ('70000000-0000-0000-0000-000000000002', 'EVT20260808-0002', 'eKelas Usahawan — Design Bootcamp KL', '40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000020', 'Workshop',  'NADI KL Pusat, Bilik Seminar',    '2026-08-10', '09:00', '17:00', '30000000-0000-0000-0000-000000000003', 30, 25, 22, 'completed', 'Design Bootcamp for aspiring entrepreneurs'),
  ('70000000-0000-0000-0000-000000000003', 'EVT20260815-0003', 'AI WIRA — Bengkel AI Johor Bahru',    '40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'Workshop',  'NADI Johor Bahru, Dewan Latihan', '2026-08-20', '09:00', '17:00', '30000000-0000-0000-0000-000000000004', 35, 30, 28, 'completed', 'AI WIRA community workshop'),
  ('70000000-0000-0000-0000-000000000004', 'EVT20260901-0004', 'eKelas Pelajar — Sesi September Shah Alam','40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000002', 'Training', 'NADI Shah Alam, Bilik Komputer', '2026-09-05', '09:00', '17:00', '30000000-0000-0000-0000-000000000002', 40, 35, 0, 'registration_open', 'September session for eKelas Pelajar'),
  ('70000000-0000-0000-0000-000000000005', 'EVT20260912-0005', 'AI WIRA — Georgetown Intensive',      '40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000006', 'Seminar',   'NADI Georgetown, Dewan Besar',    '2026-09-15', '09:00', '17:00', '30000000-0000-0000-0000-000000000004', 50, 45, 0, 'scheduled', 'AI WIRA intensive programme for Georgetown');

-- ─── KPI DEFINITIONS ──────────────────────────────────────────────────────

INSERT INTO kpis (id, kpi_code, kpi_name, description, unit, category, applies_to, period, target_value, warning_threshold, critical_threshold) VALUES
  ('80000000-0000-0000-0000-000000000001', 'KPI-PART-TOTAL',    'Total Participants',              'Total registered participants across all programmes', 'count',      'participation', 'programme', 'yearly', 2500, 70, 50),
  ('80000000-0000-0000-0000-000000000002', 'KPI-ATTEND-RATE',   'Attendance Rate',                 'Average attendance rate across all events',          'percentage', 'attendance',    'programme', 'yearly',   85, 70, 50),
  ('80000000-0000-0000-0000-000000000003', 'KPI-COMPLETE-RATE', 'Programme Completion Rate',       'Percentage of participants who complete programme',   'percentage', 'completion',    'programme', 'yearly',   75, 60, 40),
  ('80000000-0000-0000-0000-000000000004', 'KPI-CERT-ISSUE',    'Certificates Issued',             'Total certificates issued',                          'count',      'certificate',   'programme', 'yearly', 1500, 70, 50),
  ('80000000-0000-0000-0000-000000000005', 'KPI-EVENTS',        'Events Conducted',                'Total events/sessions conducted',                    'count',      'event',         'programme', 'yearly',  150, 70, 50),
  ('80000000-0000-0000-0000-000000000006', 'KPI-NADI-COVERAGE', 'NADI Sites Coverage',             'Number of NADI sites actively running programmes',   'count',      'nadi',          'programme', 'yearly',   60, 70, 50);

-- ─── KPI TARGETS (2026) ────────────────────────────────────────────────────

INSERT INTO kpi_targets (kpi_id, period_year, target_value) VALUES
  ('80000000-0000-0000-0000-000000000001', 2026, 2500),
  ('80000000-0000-0000-0000-000000000002', 2026,   85),
  ('80000000-0000-0000-0000-000000000003', 2026,   75),
  ('80000000-0000-0000-0000-000000000004', 2026, 1500),
  ('80000000-0000-0000-0000-000000000005', 2026,  150),
  ('80000000-0000-0000-0000-000000000006', 2026,   60);

-- ─── KPI RESULTS (Demo Actuals) ───────────────────────────────────────────

INSERT INTO kpi_results (kpi_id, period_year, actual_value, target_value, achievement_pct, status) VALUES
  ('80000000-0000-0000-0000-000000000001', 2026, 2485, 2500,  99.4, 'near_target'),
  ('80000000-0000-0000-0000-000000000002', 2026,   87,   85, 102.4, 'on_target'),
  ('80000000-0000-0000-0000-000000000003', 2026,   74,   75,  98.7, 'near_target'),
  ('80000000-0000-0000-0000-000000000004', 2026, 1218, 1500,  81.2, 'near_target'),
  ('80000000-0000-0000-0000-000000000005', 2026,  156,  150, 104.0, 'on_target'),
  ('80000000-0000-0000-0000-000000000006', 2026,   47,   60,  78.3, 'near_target');

-- ─── CERTIFICATE TEMPLATE ─────────────────────────────────────────────────

INSERT INTO certificate_templates (id, programme_id, template_name, issuer_name, signature_name, is_default) VALUES
  ('90000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'eKelas Pelajar Standard Certificate',    'SpectrumMY Programme', 'Pengarah SpectrumMY', TRUE),
  ('90000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'eKelas Usahawan Standard Certificate',  'SpectrumMY Programme', 'Pengarah SpectrumMY', TRUE),
  ('90000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', 'AI WIRA Standard Certificate',          'SpectrumMY Programme', 'Pengarah SpectrumMY', TRUE);
