-- ==============================================================================
-- Migration 0016: Complete Course Curriculum for SPM-LMS-MC-001
-- Course: Startup Launch Essentials — Malaysia
-- ==============================================================================

-- 1. Update Course Master Title, Description and Settings
UPDATE courses
SET
  title = 'Startup Launch Essentials — Malaysia',
  description = 'A practical Malaysian micro-credential course that guides learners through customer problem validation, business modelling, unit economics, SSM/business registration fundamentals, regulatory awareness and startup launch planning.',
  level = 'Beginner / Practical',
  learning_hours = 12.00,
  min_pass_score = 80.00
WHERE course_code = 'SPM-LMS-MC-001';

UPDATE credentials
SET
  name = 'Startup Launch Essentials — Malaysia',
  description = 'Recognizes assessed knowledge and practical competency in market problem validation, business model design, unit economics, SSM business registration, and startup launch execution in Malaysia.',
  level = 'Beginner / Practical',
  learning_hours = 12
WHERE credential_code = 'SPM-LMS-MC-001';

-- Update Certificate Template Title
UPDATE certificate_templates
SET
  template_name = 'Startup Launch Essentials — Malaysia Certificate of Achievement'
WHERE template_code = 'MC-001-STANDARD';

-- Clean existing contents for MC-001 lessons before inserting complete curriculum
DELETE FROM course_contents
WHERE lesson_id IN (
  'b2000000-0000-0000-0000-000000000001',
  'b2000000-0000-0000-0000-000000000002',
  'b2000000-0000-0000-0000-000000000003',
  'b2000000-0000-0000-0000-000000000004',
  'b2000000-0000-0000-0000-000000000005',
  'b2000000-0000-0000-0000-000000000006',
  'b2000000-0000-0000-0000-000000000007',
  'b2000000-0000-0000-0000-000000000008'
);

-- ==============================================================================
-- 2. LESSON 1.1: Problem-Solution Fit in Malaysia
-- ==============================================================================

INSERT INTO course_contents (lesson_id, title, content_type, content_body, sort_order, duration_sec)
VALUES
(
  'b2000000-0000-0000-0000-000000000001',
  'Section 1: Business Idea vs. Real Customer Problem',
  'html',
  '<div class="prose max-w-none space-y-4">
    <h3>Why Startups Fail: The Myth of the "Great Idea"</h3>
    <p>The number one reason startups fail in Malaysia and globally is <strong>building something nobody actually wants</strong>. An idea is simply an unvalidated founder assumption; a customer problem is an existing, painful friction in a customer''s daily life or business operations.</p>
    <div class="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg my-4">
      <h4 class="font-bold text-amber-900">Malaysian Contrast Example</h4>
      <p class="text-sm text-amber-800"><strong>Idea-First Thinking:</strong> <em>"I want to make an AI-powered smart vending machine for premium organic matcha tea in Bangsar."</em> (Assumption: People want matcha vending machines).</p>
      <p class="text-sm text-amber-800 mt-2"><strong>Problem-First Thinking:</strong> <em>"Busy office workers in KL Sentral have only 15 minutes between LRT transfers and experience 20-minute queues for hot breakfast."</em> (Problem: Time-starved commuters with validated morning friction).</p>
    </div>
    <h4>Self-Reflection Exercise</h4>
    <ul class="list-disc pl-5 text-sm space-y-1">
      <li><strong>My business idea:</strong> What product or service am I thinking of providing?</li>
      <li><strong>Who might buy it?</strong> Which specific group in Malaysia feels this daily?</li>
      <li><strong>What real problem does it solve?</strong> What painful workaround are they currently using?</li>
    </ul>
  </div>',
  1,
  15
),
(
  'b2000000-0000-0000-0000-000000000001',
  'Section 2 & 3: Understanding the Malaysian Consumer & Discovery',
  'html',
  '<div class="prose max-w-none space-y-4">
    <h3>The Diversity of Malaysian Consumer Behavior</h3>
    <p>Malaysia is a nuanced, multi-cultural market where consumer choices vary substantially across geography (Klang Valley vs. East Coast vs. Sabah/Sarawak), income brackets (B40, M40, T20), and cultural expectations.</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
      <div class="border border-slate-200 p-3 rounded-lg bg-slate-50">
        <h5 class="font-bold text-slate-800 text-sm">Digital & Payment Culture</h5>
        <p class="text-xs text-slate-600 mt-1">High smartphone penetration. Consumers expect cashless payment options (DuitNow QR, Touch ''n Go eWallet, GrabPay, FPX online banking). Cash-on-delivery (COD) remains significant in non-urban e-commerce.</p>
      </div>
      <div class="border border-slate-200 p-3 rounded-lg bg-slate-50">
        <h5 class="font-bold text-slate-800 text-sm">Halal & Cultural Sensitivity</h5>
        <p class="text-xs text-slate-600 mt-1">For F&B, cosmetics, and lifestyle products, Halal integrity, ingredient transparency, and respectful cross-cultural marketing are essential criteria for mass adoption in Malaysia.</p>
      </div>
    </div>
    <h4>The 5 Core Discovery Questions</h4>
    <ol class="list-decimal pl-5 text-sm space-y-1">
      <li><strong>Who</strong> specifically has this problem? (e.g. Subang Jaya university students without personal cars).</li>
      <li><strong>What</strong> exact inconvenience or pain occurs? (e.g. Inability to get affordable laundry done on rainy days).</li>
      <li><strong>When</strong> does this situation happen? (e.g. Monsoon season, exam weeks).</li>
      <li><strong>How frequently</strong> does it happen? (e.g. 2 times per week).</li>
      <li><strong>What</strong> is the customer currently doing? (e.g. Hanging clothes indoors in cramped dorm rooms, resulting in damp smells).</li>
    </ol>
  </div>',
  2,
  20
),
(
  'b2000000-0000-0000-0000-000000000001',
  'Section 4, 5 & 6: Severity Matrix, Fit & Value Proposition',
  'html',
  '<div class="prose max-w-none space-y-4">
    <h3>Evaluating Problem Severity (The F.P.C.U. Framework)</h3>
    <p>Rate the identified problem across five critical dimensions on a 1–5 scale:</p>
    <ul class="list-disc pl-5 text-sm space-y-1">
      <li><strong>Frequency:</strong> Does this happen daily, weekly, or once a year?</li>
      <li><strong>Pain Level:</strong> Is it a mild annoyance (vitamin) or a critical crisis (painkiller)?</li>
      <li><strong>Cost:</strong> Does the problem waste money or loss of income?</li>
      <li><strong>Urgency:</strong> Must the customer resolve it immediately?</li>
      <li><strong>Existing Alternatives:</strong> Are existing options clunky, overpriced, or non-existent?</li>
    </ul>
    <div class="p-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg my-4">
      <h4 class="font-bold text-blue-950">The Malaysian Value Proposition Formula</h4>
      <p class="text-sm text-blue-900 font-mono mt-1">
        "For <strong>[target customer in Malaysia]</strong> who <strong>[painful problem/need]</strong>, our <strong>[product/service]</strong> provides <strong>[quantifiable benefit]</strong> unlike <strong>[current alternative]</strong>, because <strong>[compelling reason to believe]</strong>."
      </p>
    </div>
  </div>',
  3,
  15
),
(
  'b2000000-0000-0000-0000-000000000001',
  'Knowledge Check: Lesson 1.1 (10 Questions)',
  'quiz',
  '{"pass_pct": 70, "questions": [
    {"q": "What is the primary reason the majority of early-stage startups fail?", "options": ["Lack of sophisticated office premises", "Building a product or service that lacks real market demand", "Not having an international patent", "Hiring too many technical developers"], "answer": 1, "explanation": "CB Insights and startup post-mortems show building something nobody wants is the #1 cause of failure."},
    {"q": "How does a customer problem differ from a business idea?", "options": ["An idea is an unverified hypothesis, while a problem is an existing real-world friction", "A problem always requires government grant funding", "An idea always comes with customer interviews", "There is no difference between them"], "answer": 0, "explanation": "A problem exists independently of your business; an idea is your proposed way of solving it."},
    {"q": "Which payment method is universally recognized and widely adopted for merchant transactions across Malaysia?", "options": ["Cryptocurrency token transfers", "DuitNow QR payments", "Cheques by registered post", "Western Union telegraphic orders"], "answer": 1, "explanation": "DuitNow QR is the interoperable national QR payment standard in Malaysia supported by all major banks and e-wallets."},
    {"q": "In customer discovery, what does the ''Frequency'' dimension assess?", "options": ["How fast your website servers load", "How often the target customer encounters the specific problem", "How many times you advertise on TikTok", "How many shareholders your company has"], "answer": 1, "explanation": "Frequency measures whether the friction occurs daily, weekly, or intermittently."},
    {"q": "What does a ''painkiller'' business mean compared to a ''vitamin''?", "options": ["A business selling registered pharmaceutical drugs only", "A solution addressing an urgent, painful, high-priority necessity rather than a nice-to-have benefit", "A company that provides free medical checkups", "An idea funded by venture capital"], "answer": 1, "explanation": "Painkillers solve immediate urgent pain points that customers actively budget and pay to eliminate."},
    {"q": "Why is customer scoring (e.g. 1-5 severity) useful during problem discovery?", "options": ["It guarantees immediate bank loan approval", "It proves legally that customers will buy your product", "It serves as a prioritization guide to identify which problem merits deeper research", "It replaces the need to conduct any interviews"], "answer": 2, "explanation": "Severity scoring prioritizes hypotheses; only real customer validation confirms demand."},
    {"q": "In the Value Proposition formula, what does ''unlike [alternative]'' represent?", "options": ["The customer''s previous education", "The current workaround, competitor, or substitute the customer currently uses", "The government ministry in charge of entrepreneurship", "The delivery courier you will use"], "answer": 1, "explanation": "Customers always have an existing alternative—even if it is doing nothing or using manual spreadsheets."},
    {"q": "Why is cultural awareness critical when launching a consumer product in Malaysia?", "options": ["Every state in Malaysia speaks a completely different official language", "Consumer dietary requirements, Halal considerations, and values influence purchasing decisions", "It is legally required to translate every social media post into four languages", "Malaysian consumers do not shop online"], "answer": 1, "explanation": "Multi-ethnic cultural nuances and Halal integrity heavily guide Malaysian purchasing trust."},
    {"q": "What should a founder do if customer discovery shows that target customers do not care about the problem?", "options": ["Spend more money on Instagram advertising to convince them", "Pivot or modify the problem statement and explore other validated pain points", "Immediately register an SSM Sdn Bhd company", "Ignore the feedback because customers do not know what they want"], "answer": 1, "explanation": "A smart entrepreneur pivots when initial assumptions are disproved by evidence."},
    {"q": "What is the recommended pass mark for micro-credential knowledge checks in SPM-LMS-MC-001?", "options": ["30%", "50%", "70%", "100%"], "answer": 2, "explanation": "70% is the benchmark pass mark for lesson-level knowledge checks."}
  ]}',
  4,
  10
);

-- ==============================================================================
-- 3. LESSON 1.2: Customer Discovery Practical Task
-- ==============================================================================

INSERT INTO course_contents (lesson_id, title, content_type, content_body, sort_order, duration_sec)
VALUES
(
  'b2000000-0000-0000-0000-000000000002',
  'Section 1 & 2: Customer Interview Principles & Question Bank',
  'html',
  '<div class="prose max-w-none space-y-4">
    <h3>The Mom Test Principles: How to Talk to Customers</h3>
    <p>When asking people about your idea, they will often say <em>"Wah, very good, I definitely will buy!"</em> out of politeness. This is <strong>false validation</strong>. Your objective in customer discovery is not to pitch or sell; it is to investigate actual past behavior.</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
      <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <h5 class="font-bold text-emerald-900 text-sm">DO (Evidence-Seeking):</h5>
        <ul class="text-xs text-emerald-800 list-disc pl-4 space-y-1 mt-1">
          <li>Ask open-ended questions starting with "Tell me about the last time..."</li>
          <li>Listen 80% of the time, speak only 20%.</li>
          <li>Ask how much time or money they actually spent resolving it.</li>
          <li>Look for emotional frustration in past experiences.</li>
        </ul>
      </div>
      <div class="p-4 bg-rose-50 border border-rose-200 rounded-lg">
        <h5 class="font-bold text-rose-900 text-sm">DO NOT (Validation Traps):</h5>
        <ul class="text-xs text-rose-800 list-disc pl-4 space-y-1 mt-1">
          <li>Do NOT pitch your product or show mockups early in the call.</li>
          <li>Do NOT ask leading questions: "Wouldn''t you love an app that does X?"</li>
          <li>Do NOT ask hypothetical future questions: "Would you pay RM50 for this?"</li>
          <li>Do NOT defend your idea when a respondent expresses disinterest.</li>
        </ul>
      </div>
    </div>
    <h4>The 8 Practical Interview Questions</h4>
    <ol class="list-decimal pl-5 text-sm space-y-1">
      <li><em>"Tell me about the last time you experienced [Problem X]?"</em></li>
      <li><em>"What did you do to solve or manage it back then?"</em></li>
      <li><em>"How much time did it take you to resolve?"</em></li>
      <li><em>"Did it cost you any money, and if so, how much?"</em></li>
      <li><em>"What current product, app, or manual workaround do you use today?"</em></li>
      <li><em>"What is the most frustrating part about your current method?"</em></li>
      <li><em>"How often does this situation come up in your week or month?"</em></li>
      <li><em>"If you had a magic wand, what would make this whole process simpler?"</em></li>
    </ol>
  </div>',
  1,
  30
),
(
  'b2000000-0000-0000-0000-000000000002',
  'Section 3, 4 & 5: Conducting 5 Interviews, Evidence Analysis & Pivot Decisions',
  'html',
  '<div class="prose max-w-none space-y-4">
    <h3>Classifying Evidence: Confirmed, Uncertain, or Disproved</h3>
    <p>After completing at least <strong>5 customer interviews</strong> (recommended: 10), review your interview notes and sort your findings into three distinct buckets:</p>
    <ul>
      <li><strong>CONFIRMED:</strong> At least 4 out of 5 interviewees independently reported the exact same friction without being prompted, and have actively spent time or money trying to fix it.</li>
      <li><strong>UNCERTAIN:</strong> Respondents acknowledge the situation exists, but it happens infrequently and causes little real disruption.</li>
      <li><strong>DISPROVED:</strong> Respondents state that current alternatives (e.g. existing free WhatsApp groups or Shopee options) are completely satisfactory.</li>
    </ul>
    <h4>The Pivot Decision Framework</h4>
    <p>Based on your evidence, choose one of the following strategic decisions:</p>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center my-3">
      <div class="p-3 bg-slate-100 rounded-lg border border-slate-200">
        <span class="font-bold text-xs text-slate-800 block">1. PROCEED</span>
        <span class="text-[11px] text-slate-600">Problem is confirmed; customers are eager for better solutions.</span>
      </div>
      <div class="p-3 bg-slate-100 rounded-lg border border-slate-200">
        <span class="font-bold text-xs text-slate-800 block">2. MODIFY / ADJUST</span>
        <span class="text-[11px] text-slate-600">Problem is real, but customer segment or feature scope needs tweaking.</span>
      </div>
      <div class="p-3 bg-slate-100 rounded-lg border border-slate-200">
        <span class="font-bold text-xs text-slate-800 block">3. FULL PIVOT</span>
        <span class="text-[11px] text-slate-600">Initial problem disproved; pivot to an unexpected opportunity discovered during interviews.</span>
      </div>
    </div>
  </div>',
  2,
  35
),
(
  'b2000000-0000-0000-0000-000000000002',
  'Assignment: Customer Discovery Interview Log Submission',
  'assignment',
  '<div class="prose max-w-none space-y-3">
    <h4>Customer Discovery Log Guidelines</h4>
    <p class="text-sm">Conduct and document a minimum of <strong>5 structured customer interviews</strong> with real individuals in Malaysia. In your report, include:</p>
    <ol class="list-decimal pl-5 text-xs space-y-1">
      <li>Target Customer Profile description.</li>
      <li>5 Interview Summary Cards (Date, Location/Platform, Occupation, Current Solution, Pain Points, Willingness-to-pay signals).</li>
      <li>Synthesis table: List findings categorized into CONFIRMED, UNCERTAIN, and DISPROVED.</li>
      <li>Strategic Pivot or Proceed Decision with 2-paragraph justification.</li>
    </ol>
    <p class="text-xs text-slate-500 italic mt-2">This log will be included as Milestone 1 in your final Startup Launch Portfolio Capstone.</p>
  </div>',
  3,
  15
),
(
  'b2000000-0000-0000-0000-000000000002',
  'Knowledge Check: Lesson 1.2 (10 Questions)',
  'quiz',
  '{"pass_pct": 70, "questions": [
    {"q": "What is the ''Mom Test'' rule regarding questions in customer discovery?", "options": ["Always bring your mother to your business meetings", "Never ask anyone if they think your business idea is good; ask about their past actions instead", "Only interview family members for feedback", "Ask how much money your parents will invest in you"], "answer": 1, "explanation": "People lie to be polite; ask about concrete past behavior rather than opinions about the future."},
    {"q": "Which of the following is a dangerous leading question to avoid?", "options": ["''Tell me about the last time you bought pet food online?''", "''Wouldn''t you love an app that delivers fresh hot pastries to your door in 10 minutes?''", "''How much do you currently spend on pet grooming per month?''", "''What was the hardest part about ordering supplies last week?''"], "answer": 1, "explanation": "''Wouldn''t you love...'' leads the witness into a polite affirmative answer."},
    {"q": "What is the recommended ratio of talking vs. listening for the interviewer?", "options": ["Interviewer speaks 80%, customer listens 20%", "Interviewer speaks 50%, customer speaks 50%", "Interviewer listens 80%, customer speaks 80%", "Interviewer listens 80%, speaks only 20% to guide the questions"], "answer": 3, "explanation": "Effective discovery requires the founder to actively listen to the customer''s experiences."},
    {"q": "What is the minimum number of customer interviews required in this micro-credential assignment?", "options": ["1 interview", "5 interviews", "50 interviews", "100 interviews"], "answer": 1, "explanation": "A minimum of 5 interviews is required to begin spotting recurring patterns."},
    {"q": "If all 5 interviewees state they already use free WhatsApp groups and have zero issues, your hypothesis is:", "options": ["Confirmed", "Disproved or unviable as currently framed", "Ready for bank investment", "Guaranteed to succeed"], "answer": 1, "explanation": "If current alternatives satisfy the customer, the friction does not support commercial demand."},
    {"q": "What is a ''Pivot'' in startup terminology?", "options": ["Closing down the business permanently", "A structured course correction in strategy without changing the overarching vision", "A legal lawsuit filed with SSM", "A dividend payout to angel investors"], "answer": 1, "explanation": "A pivot adjusts customer, problem, or solution based on real market evidence."},
    {"q": "Why is asking ''Would you pay RM100 for this in the future?'' unreliable?", "options": ["Because Malaysian Ringgit cannot be spent in the future", "Because hypothetical money is free; people say yes until their wallet is actually opened", "Because banks do not allow online payments over RM50", "Because customers will always answer with their exact credit card number"], "answer": 1, "explanation": "Hypothetical commitments do not equal real economic transactions."},
    {"q": "What is a strong behavioral signal of willingness to pay?", "options": ["The customer said ''Looks interesting''", "The customer currently spends money or effort on an imperfect workaround", "The customer liked your Facebook page", "The customer is your best friend"], "answer": 1, "explanation": "Existing expenditure of time or money proves the problem is prioritized by the customer."},
    {"q": "When should you show a product prototype or demo during early discovery?", "options": ["In the first 30 seconds of the interview", "After you have thoroughly explored their unprompted problems and past behavior", "Never show anything under any circumstances", "Only after registering a trademark with MyIPO"], "answer": 1, "explanation": "Explore the problem first so you don''t bias the customer''s genuine feedback."},
    {"q": "What is the immediate next step if customer discovery confirms your problem hypothesis?", "options": ["Take out a RM500,000 commercial loan", "Construct a Business Model Canvas and test unit economics", "Buy expensive office furniture", "Stop talking to customers forever"], "answer": 1, "explanation": "Validated problem-solution fit leads into business modeling and unit economics in Module 2."}
  ]}',
  4,
  10
);

-- ==============================================================================
-- 4. MODULE 2: Business Model Canvas & Unit Economics
-- ==============================================================================

INSERT INTO course_contents (lesson_id, title, content_type, content_body, sort_order, duration_sec)
VALUES
(
  'b2000000-0000-0000-0000-000000000003',
  'The 9 Building Blocks of the Business Model Canvas (Malaysian Edition)',
  'html',
  '<div class="prose max-w-none space-y-4">
    <h3>Visualizing Your Entire Business on One Page</h3>
    <p>The Business Model Canvas (BMC), developed by Alexander Osterwalder, maps the 9 foundational pillars of any sustainable commercial enterprise. In Malaysia, localizing these blocks is essential for profitability:</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 my-4 text-xs">
      <div class="border border-indigo-200 p-3 rounded-lg bg-indigo-50/50">
        <strong class="text-indigo-900 block font-bold">1. Customer Segments</strong>
        <span class="text-indigo-700">e.g. Working mothers in Shah Alam seeking healthy Halal ready-to-cook meal kits.</span>
      </div>
      <div class="border border-indigo-200 p-3 rounded-lg bg-indigo-50/50">
        <strong class="text-indigo-900 block font-bold">2. Value Propositions</strong>
        <span class="text-indigo-700">e.g. 15-minute dinner prep, certified Halal, zero MSG, delivered fresh weekly.</span>
      </div>
      <div class="border border-indigo-200 p-3 rounded-lg bg-indigo-50/50">
        <strong class="text-indigo-900 block font-bold">3. Channels</strong>
        <span class="text-indigo-700">e.g. TikTok Shop, WhatsApp Catalogue, weekly popup at community farmer markets.</span>
      </div>
      <div class="border border-indigo-200 p-3 rounded-lg bg-indigo-50/50">
        <strong class="text-indigo-900 block font-bold">4. Customer Relationships</strong>
        <span class="text-indigo-700">e.g. VIP WhatsApp broadcast recipe group, automated monthly refill reminders.</span>
      </div>
      <div class="border border-indigo-200 p-3 rounded-lg bg-indigo-50/50">
        <strong class="text-indigo-900 block font-bold">5. Revenue Streams</strong>
        <span class="text-indigo-700">e.g. Direct meal kit sales (RM35/pack), recurring monthly subscription (RM120/mo).</span>
      </div>
      <div class="border border-indigo-200 p-3 rounded-lg bg-indigo-50/50">
        <strong class="text-indigo-900 block font-bold">6. Key Resources</strong>
        <span class="text-indigo-700">e.g. Commercial prep kitchen, food-grade vacuum sealer, cold-chain cool bags.</span>
      </div>
      <div class="border border-indigo-200 p-3 rounded-lg bg-indigo-50/50">
        <strong class="text-indigo-900 block font-bold">7. Key Activities</strong>
        <span class="text-indigo-700">e.g. Ingredient sourcing, sanitary meal prep, order packaging, courier handover.</span>
      </div>
      <div class="border border-indigo-200 p-3 rounded-lg bg-indigo-50/50">
        <strong class="text-indigo-900 block font-bold">8. Key Partnerships</strong>
        <span class="text-indigo-700">e.g. Local wet market wholesalers (Pasar Borong), cold-chain courier (Lalamove / GrabExpress).</span>
      </div>
      <div class="border border-indigo-200 p-3 rounded-lg bg-indigo-50/50">
        <strong class="text-indigo-900 block font-bold">9. Cost Structure</strong>
        <span class="text-indigo-700">e.g. Ingredients (COGS), biodegradable packaging, kitchen rental, delivery fees.</span>
      </div>
    </div>
  </div>',
  1,
  45
),
(
  'b2000000-0000-0000-0000-000000000003',
  'Knowledge Check: Lesson 2.1 (10 Questions)',
  'quiz',
  '{"pass_pct": 70, "questions": [
    {"q": "How many building blocks are in the standard Business Model Canvas?", "options": ["4 blocks", "7 blocks", "9 blocks", "12 blocks"], "answer": 2, "explanation": "The Osterwalder Business Model Canvas is structured into 9 core blocks."},
    {"q": "Which block describes how a company communicates with and reaches its customer segments?", "options": ["Key Partnerships", "Channels", "Cost Structure", "Key Resources"], "answer": 1, "explanation": "Channels represent the touchpoints where customers discover, purchase, and receive products."},
    {"q": "In Malaysia, selling products via TikTok Shop or WhatsApp Catalogue is an example of:", "options": ["Revenue Streams and Delivery Channels", "A municipal council license", "Key Partnerships only", "A registered trade union"], "answer": 0, "explanation": "TikTok Shop and WhatsApp are primary digital sales channels and revenue capture mechanisms."},
    {"q": "What is the relationship between the Value Proposition and Customer Segments?", "options": ["They must be completely unrelated", "The Value Proposition solves the specific pain point of that targeted Customer Segment", "Customer Segments only apply to government departments", "Value Propositions are only written for bank investors"], "answer": 1, "explanation": "Value propositions are tailored to deliver targeted benefits to specific customer segments."},
    {"q": "Raw ingredient suppliers at Pasar Borong Selayang represent which block for a food startup?", "options": ["Customer Relationships", "Key Partnerships", "Revenue Streams", "Value Proposition"], "answer": 1, "explanation": "Suppliers and vendors are vital Key Partners that provide essential inputs."},
    {"q": "Which block outlines all expenses incurred to operate the business model?", "options": ["Cost Structure", "Key Activities", "Customer Segments", "Value Proposition"], "answer": 0, "explanation": "Cost Structure captures all operational and capital expenses."},
    {"q": "What are recurring subscription boxes an example of?", "options": ["Customer Segment", "Revenue Stream", "Key Resource", "Statutory tax"], "answer": 1, "explanation": "Subscription fees generate predictable recurring revenue streams."},
    {"q": "Why is the Business Model Canvas preferred over a 50-page traditional business plan in early stages?", "options": ["Because founders cannot write English", "Because it is agile, rapid to iterate, and visualizes interdependencies on one page", "Because banks do not accept business plans", "Because the government bans long documents"], "answer": 1, "explanation": "The BMC allows early-stage founders to test, adapt, and iterate hypotheses rapidly."},
    {"q": "Which block covers physical machinery, proprietary recipes, intellectual property, and key staff?", "options": ["Channels", "Key Resources", "Customer Segments", "Revenue Streams"], "answer": 1, "explanation": "Key Resources are the physical, intellectual, human, and financial assets required."},
    {"q": "Can a startup have multiple customer segments with distinct value propositions?", "options": ["No, a startup is legally limited to one customer type", "Yes, such as a two-sided platform catering to both merchants and buyers", "Only if the company has over 1,000 employees", "Only in foreign countries"], "answer": 1, "explanation": "Multi-sided platforms (like Grab or food delivery apps) serve distinct segments simultaneously."}
  ]}',
  2,
  15
);

-- ==============================================================================
-- 5. LESSON 2.2: Unit Economics & Breakeven Modeling
-- ==============================================================================

INSERT INTO course_contents (lesson_id, title, content_type, content_body, sort_order, duration_sec)
VALUES
(
  'b2000000-0000-0000-0000-000000000004',
  'Anatomy of a Unit: Price, Variable Costs, Contribution Margin & Breakeven',
  'html',
  '<div class="prose max-w-none space-y-4">
    <h3>Mastering Malaysian Unit Economics</h3>
    <p>Many founders generate high sales on Shopee or TikTok, yet find their bank balance empty at month-end. This is almost always caused by a failure to calculate <strong>Unit Economics</strong>—the direct revenues and direct costs associated with a single unit of sale.</p>
    
    <div class="p-4 bg-slate-50 border border-slate-300 rounded-lg my-3 space-y-2">
      <h4 class="font-bold text-slate-900 text-sm">Key Mathematical Formulas:</h4>
      <p class="font-mono text-xs text-indigo-900"><strong>Contribution Margin (CM) per unit</strong> = Selling Price − Variable Costs per unit</p>
      <p class="font-mono text-xs text-indigo-900"><strong>Contribution Margin Ratio (CM%)</strong> = (CM per unit / Selling Price) × 100%</p>
      <p class="font-mono text-xs text-indigo-900"><strong>Breakeven Point in Units (BEP)</strong> = Total Monthly Fixed Costs / CM per unit</p>
      <p class="font-mono text-xs text-indigo-900"><strong>Breakeven Revenue (RM)</strong> = BEP in Units × Selling Price</p>
    </div>

    <h4>Practical Malaysian Case Study: Artisan Sambal Jar</h4>
    <div class="overflow-x-auto text-xs my-3">
      <table class="w-full border-collapse border border-slate-300">
        <tr class="bg-slate-100 font-bold"><td class="border p-2">Item</td><td class="border p-2">Amount (RM)</td><td class="border p-2">Classification</td></tr>
        <tr><td class="border p-2">Selling Price per Jar</td><td class="border p-2">RM 20.00</td><td class="border p-2">Unit Revenue</td></tr>
        <tr><td class="border p-2">Chilies, oil, shrimp paste & spices</td><td class="border p-2">RM 4.50</td><td class="border p-2">Variable Cost (COGS)</td></tr>
        <tr><td class="border p-2">Glass jar, tamper-evident lid & sticker label</td><td class="border p-2">RM 2.50</td><td class="border p-2">Variable Cost (Packaging)</td></tr>
        <tr><td class="border p-2">Platform transaction fee & payment gateway (4%)</td><td class="border p-2">RM 0.80</td><td class="border p-2">Variable Cost (Transaction)</td></tr>
        <tr class="bg-indigo-50 font-bold"><td class="border p-2">Total Variable Cost per Unit</td><td class="border p-2">RM 7.80</td><td class="border p-2">Sum of Variable Costs</td></tr>
        <tr class="bg-emerald-50 font-bold"><td class="border p-2">Contribution Margin per Jar</td><td class="border p-2">RM 12.20</td><td class="border p-2">Price (RM20) - Variable (RM7.80)</td></tr>
      </table>
    </div>

    <h4>Calculating Monthly Breakeven</h4>
    <p>Suppose the founder has the following <strong>Monthly Fixed Costs</strong>:</p>
    <ul class="text-xs list-disc pl-4 space-y-1">
      <li>Central Kitchen rental & maintenance: RM 1,800 / month</li>
      <li>Utilities (commercial TNB & Air Selangor): RM 400 / month</li>
      <li>Social media advertising & accounting software: RM 840 / month</li>
      <li><strong>Total Monthly Fixed Costs = RM 3,040</strong></li>
    </ul>
    <div class="p-3 bg-emerald-50 border-l-4 border-emerald-600 rounded-r text-xs mt-2">
      <p class="font-bold text-emerald-950">Breakeven Calculation:</p>
      <p class="mt-1 font-mono">Breakeven Volume = RM 3,040 / RM 12.20 = <strong>249.18 $\rightarrow$ 250 Jars / month</strong></p>
      <p class="font-mono">Daily Target = 250 jars / 25 working days = <strong>10 jars per day</strong></p>
      <p class="text-emerald-800 mt-1">Selling fewer than 250 jars produces a financial loss; selling jar #251 onwards generates pure net profit of RM 12.20 per jar!</p>
    </div>
  </div>',
  1,
  45
),
(
  'b2000000-0000-0000-0000-000000000004',
  'Knowledge Check: Lesson 2.2 (10 Questions)',
  'quiz',
  '{"pass_pct": 70, "questions": [
    {"q": "What is the formula for Contribution Margin per unit?", "options": ["Selling Price + Fixed Costs", "Selling Price − Variable Cost per unit", "Total Revenue / Total Employees", "Net Profit × Corporate Tax Rate"], "answer": 1, "explanation": "Contribution Margin per unit is Selling Price minus Variable Cost per unit."},
    {"q": "Which of the following is considered a Fixed Cost for a business?", "options": ["Raw packaging boxes ordered per item sold", "Monthly office or shop lot rental", "Payment gateway fees per transaction", "Courier shipping charges per parcel"], "answer": 1, "explanation": "Shop lot rental must be paid regardless of whether sales are 0 or 1,000 units."},
    {"q": "If a product sells for RM 50.00 and has variable costs of RM 20.00, what is the Contribution Margin?", "options": ["RM 70.00", "RM 30.00", "RM 2.50", "RM 1,000.00"], "answer": 1, "explanation": "RM 50.00 − RM 20.00 = RM 30.00."},
    {"q": "If monthly fixed costs are RM 6,000 and the Contribution Margin per unit is RM 30, how many units must be sold to break even?", "options": ["20 units", "100 units", "200 units", "600 units"], "answer": 2, "explanation": "Breakeven = RM 6,000 / RM 30 = 200 units per month."},
    {"q": "What happens once sales volume exceeds the breakeven point?", "options": ["The company immediately enters bankruptcy", "Every additional unit sold contributes directly to operating profit", "Fixed costs automatically double", "The product becomes illegal to sell"], "answer": 1, "explanation": "Once fixed costs are covered, the contribution margin from each additional unit flows to net profit."},
    {"q": "Why are e-commerce platform fees (e.g. 4% commission) classified as variable costs?", "options": ["Because they are paid once a year only", "Because they scale directly with each completed transaction", "Because they never change over 50 years", "Because government sets rental prices"], "answer": 1, "explanation": "Transaction fees only occur when a sale takes place, making them variable costs."},
    {"q": "What is the Contribution Margin Ratio if selling price is RM 100 and variable cost is RM 40?", "options": ["40%", "60%", "140%", "25%"], "answer": 1, "explanation": "CM = RM 60; Ratio = RM 60 / RM 100 = 60%."},
    {"q": "How can a founder lower their breakeven volume without changing fixed costs?", "options": ["Increase selling price or negotiate lower variable material costs to widen contribution margin", "Hire more staff on monthly salaries", "Move to an expensive shopping mall", "Offer 90% discounts on all items"], "answer": 0, "explanation": "Widening CM per unit lowers the number of units required to cover fixed overhead."},
    {"q": "What does COGS stand for?", "options": ["Cost of Goods Sold", "Certificate of Government Standards", "Council of Gross Sales", "Customer Oriented Growth Strategy"], "answer": 0, "explanation": "COGS is the direct Cost of Goods Sold required to manufacture or acquire inventory."},
    {"q": "If your breakeven calculation shows you must sell 10,000 units per month, but your workshop can only produce 500 units, what should you do?", "options": ["Ignore the numbers and hope for good luck", "Redesign the business model, pricing structure, or cost base because it is mathematically unviable", "Borrow money to open 10 new branches immediately", "Stop recording costs in your bookkeeping"], "answer": 1, "explanation": "A mathematically unviable breakeven volume requires restructuring pricing or operational capacity."}
  ]}',
  2,
  15
);

-- ==============================================================================
-- 6. MODULE 3: Legal Compliance & SSM Registration in Malaysia
-- ==============================================================================

INSERT INTO course_contents (lesson_id, title, content_type, content_body, sort_order, duration_sec)
VALUES
(
  'b2000000-0000-0000-0000-000000000005',
  'SSM Business Structures & EzBiz Registration Guide',
  'html',
  '<div class="prose max-w-none space-y-4">
    <h3>Suruhanjaya Syarikat Malaysia (SSM) Entity Options</h3>
    <p>In Malaysia, all commercial businesses must be legally registered with the <strong>Companies Commission of Malaysia (SSM)</strong> under either the Registration of Businesses Act 1956 (ROBA 1956) or the Companies Act 2016.</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs my-3">
      <div class="border border-slate-300 p-3 rounded-lg bg-slate-50">
        <strong class="text-slate-900 block font-bold text-sm">Sole Proprietorship (Tunggal)</strong>
        <p class="mt-1 text-slate-600">Owned by 1 Malaysian citizen/PR. Easiest and cheapest to start (RM30–60/yr). Unlimited personal liability (owner is personally responsible for all debts).</p>
      </div>
      <div class="border border-slate-300 p-3 rounded-lg bg-slate-50">
        <strong class="text-slate-900 block font-bold text-sm">Partnership (Perkongsian)</strong>
        <p class="mt-1 text-slate-600">Between 2 and 20 Malaysian partners. Shared profits and liabilities. Unlimited liability across all partners unless formed as an LLP (PLT).</p>
      </div>
      <div class="border border-slate-300 p-3 rounded-lg bg-slate-50">
        <strong class="text-slate-900 block font-bold text-sm">Sdn Bhd (Sendirian Berhad)</strong>
        <p class="mt-1 text-slate-600">Separate legal entity with limited liability. Minimum 1 director/shareholder. Higher maintenance costs (requires licensed Company Secretary and annual statutory filings).</p>
      </div>
    </div>

    <h4>Step-by-Step Registration on the SSM EzBiz Portal (ezbiz.ssm.com.my)</h4>
    <ol class="list-decimal pl-5 text-xs space-y-2">
      <li><strong>User Sign-up:</strong> Create an account on <a href="https://ezbiz.ssm.com.my" target="_blank" class="text-blue-600 underline">ezbiz.ssm.com.my</a> using your MyKad number.</li>
      <li><strong>Identity Verification (e-KYC / Biometric):</strong> Verify identity online via e-KYC or visit any SSM branch counter nationwide once for fingerprint verification.</li>
      <li><strong>Business Name Choice:</strong>
        <ul class="list-disc pl-4 mt-1">
          <li><strong>Personal Name (RM30 / year):</strong> Uses the founder''s official name exactly as shown on MyKad (e.g. <em>"Ahmad bin Abdullah"</em>). No approval form required.</li>
          <li><strong>Trade Name (RM60 / year):</strong> A brand or custom name (e.g. <em>"Sambal Dapur Warisan"</em>). Requires Form PNA42 name reservation and approval.</li>
        </ul>
      </li>
      <li><strong>Business Registration (Borang A):</strong> Submit business start date, principal place of business address, business activity codes (MSIC codes), and branch details.</li>
      <li><strong>Fee Payment & Certificate Issuance (Borang D):</strong> Pay online via FPX or credit card. Once approved, download your official <strong>Certificate of Registration (Borang D)</strong> and business information sheet (RM10.60).</li>
    </ol>
  </div>',
  1,
  50
),
(
  'b2000000-0000-0000-0000-000000000005',
  'Knowledge Check: Lesson 3.1 (10 Questions)',
  'quiz',
  '{"pass_pct": 70, "questions": [
    {"q": "Which government agency is responsible for registering businesses and companies in Malaysia?", "options": ["MDEC", "Suruhanjaya Syarikat Malaysia (SSM)", "Bank Negara Malaysia", "Jabatan Pengangkutan Jalan (JPJ)"], "answer": 1, "explanation": "SSM (Companies Commission of Malaysia) regulates business registrations and corporate compliance."},
    {"q": "Who is legally eligible to register a Sole Proprietorship (Pemilikan Tunggal) under ROBA 1956?", "options": ["Any tourist visiting Malaysia on a 30-day visa", "Malaysian citizens or permanent residents aged 18 years and above", "Anyone holding a student visa", "Only registered lawyers and chartered accountants"], "answer": 1, "explanation": "Sole proprietorships under the Registration of Businesses Act 1956 are reserved for Malaysian citizens and PRs aged 18+."},
    {"q": "What is the annual SSM registration fee for a business registered under a Personal Name matching MyKad?", "options": ["RM 30 per year", "RM 60 per year", "RM 500 per year", "It is completely free forever"], "answer": 0, "explanation": "Personal name registrations cost RM30 annually; trade names cost RM60 annually."},
    {"q": "What is the main legal risk of operating as a Sole Proprietor?", "options": ["Unlimited personal liability for all business debts and court judgements", "You cannot hire any employees", "You must hire an expensive company secretary", "You are not allowed to open a bank account"], "answer": 0, "explanation": "A sole proprietorship is not a separate legal entity; the owner''s personal assets are exposed to business debts."},
    {"q": "What official certificate is issued by SSM upon successful business registration?", "options": ["Borang D (Perakuan Pendaftaran Perniagaan)", "Borang 9", "Driving License", "Halal Certificate"], "answer": 0, "explanation": "Borang D is the official Certificate of Registration issued under the Registration of Businesses Act 1956."},
    {"q": "What is the official online portal for registering a sole proprietorship with SSM?", "options": ["MyEG Portal", "SSM EzBiz Online (ezbiz.ssm.com.my)", "LHDN MyTax", "Shopee Seller Centre"], "answer": 1, "explanation": "SSM EzBiz is the official web portal for ROBA business registrations."},
    {"q": "How many partners are permitted in a standard general partnership under the Partnership Act 1961?", "options": ["Between 2 and 20 partners", "Unlimited up to 10,000 partners", "Exactly 1 partner only", "Between 50 and 100 partners"], "answer": 0, "explanation": "A general partnership allows between 2 and 20 partners."},
    {"q": "What is the purpose of Form PNA42?", "options": ["Application for business name reservation / trade name approval", "Application for a personal bank loan", "Reporting corporate tax to LHDN", "Cancelling employee insurance"], "answer": 0, "explanation": "Borang PNA42 is used to apply for trade name approval with SSM."},
    {"q": "What is required before an EzBiz account can be used for the first time?", "options": ["Buying RM1,000 of shares", "Identity verification via e-KYC or biometric fingerprint verification at an SSM counter", "Getting a police clearance certificate", "A university degree in business"], "answer": 1, "explanation": "SSM requires identity verification to protect against fraudulent business creation."},
    {"q": "Within how many days of starting business operations must a business be registered with SSM?", "options": ["Within 30 days from commencement of business", "Within 5 years", "Never, registration is optional in Malaysia", "Only after making RM 100,000 in sales"], "answer": 0, "explanation": "Under ROBA 1956, businesses must register within 30 days of commencing operations."}
  ]}',
  2,
  15
),
(
  'b2000000-0000-0000-0000-000000000006',
  'Commercial Licensing & Statutory Obligations (PBT, LHDN, KWSP, PERKESO)',
  'html',
  '<div class="prose max-w-none space-y-4">
    <h3>Beyond SSM: Local Council & Industry Compliance</h3>
    <p>Registering with SSM gives you legal capacity to operate a business, but it <strong>does not grant automatic permission</strong> to open a physical premise or sell specialized products. Different regulators oversee local operations:</p>

    <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
      <div>
        <strong class="text-slate-900 font-bold block">1. Local Council Licenses (Pihak Berkuasa Tempatan — PBT)</strong>
        <p class="text-slate-600">Every physical shop, kiosk, or office requires a <strong>Premise License (Lesen Premis)</strong> and <strong>Signboard License (Lesen Papan Tanda)</strong> from the relevant local authority (e.g. DBKL in KL, MBPJ in Petaling Jaya, MBSA in Shah Alam).</p>
      </div>
      <div>
        <strong class="text-slate-900 font-bold block">2. Sector-Specific Approvals</strong>
        <ul class="list-disc pl-4 space-y-1 text-slate-600 mt-1">
          <li><strong>Food & Beverage:</strong> Food Handler Training certificate, Typhoid vaccination (Suntikan Tifoid), and optional JAKIM Halal Certification.</li>
          <li><strong>Cosmetics & Health Supplements:</strong> NPRA NOT (Notification Number) from the Ministry of Health (KKM) before selling.</li>
          <li><strong>Construction & Renovation:</strong> CIDB Green Card & Contractor Grade registration.</li>
        </ul>
      </div>
      <div>
        <strong class="text-slate-900 font-bold block">3. Statutory Employee Contributions</strong>
        <p class="text-slate-600">When you hire your first employee in Malaysia, you must register as an employer and make monthly deductions:</p>
        <ul class="list-disc pl-4 space-y-1 text-slate-600 mt-1">
          <li><strong>LHDN (Inland Revenue Board):</strong> Register income tax file (Borang B for sole proprietors). Monthly PCB deductions for eligible staff.</li>
          <li><strong>EPF (KWSP):</strong> Mandatory retirement savings (12-13% employer contribution, 11% employee deduction).</li>
          <li><strong>SOCSO (PERKESO) & EIS (SIP):</strong> Workplace injury insurance and employment insurance scheme.</li>
        </ul>
      </div>
    </div>
  </div>',
  1,
  45
),
(
  'b2000000-0000-0000-0000-000000000006',
  'Knowledge Check: Lesson 3.2 (10 Questions)',
  'quiz',
  '{"pass_pct": 70, "questions": [
    {"q": "Does having an SSM registration certificate allow you to operate a physical retail shop without local council permits?", "options": ["Yes, SSM overrides all local municipal councils", "No, physical business premises require a Premise and Signboard License from the local PBT", "Only if you sell products online exclusively", "Yes, as long as you pay income tax"], "answer": 1, "explanation": "SSM registration provides corporate legal identity; the local council (PBT) regulates physical premise operations."},
    {"q": "What does PBT stand for in Malaysia?", "options": ["Pihak Berkuasa Tempatan (Local Authority / Municipal Council)", "Pusat Bank Tempatan", "Persatuan Belia Malaysia", "Pengarah Bahagian Teknologi"], "answer": 0, "explanation": "PBT refers to local municipal councils such as DBKL, MBPJ, MBSA, MBJB, etc."},
    {"q": "What mandatory medical requirement applies to all food handlers in Malaysian commercial eateries?", "options": ["Yellow fever immunization", "Mandatory Typhoid vaccination (Suntikan Tifoid) and Food Handler Training", "Tuberculosis surgery", "Daily blood pressure tests"], "answer": 1, "explanation": "Food safety regulations mandate typhoid vaccination and certified food handling training."},
    {"q": "Which ministry regulatory body oversees notification numbers for cosmetics and skincare in Malaysia?", "options": ["Ministry of International Trade (MITI)", "National Pharmaceutical Regulatory Agency (NPRA) under KKM", "Department of Environment (JAS)", "National Library of Malaysia"], "answer": 1, "explanation": "NPRA under the Ministry of Health regulates pharmaceuticals, cosmetics, and health supplements."},
    {"q": "What income tax form must Sole Proprietors submit annually to LHDN?", "options": ["Borang BE", "Borang B (Individuals with business income)", "Borang C (Companies only)", "Borang EA"], "answer": 1, "explanation": "Borang B is submitted by individuals deriving income from a business source in Malaysia."},
    {"q": "Are employers in Malaysia legally mandated to contribute to EPF (KWSP) for hired local staff?", "options": ["No, it is entirely optional at the employer''s discretion", "Yes, statutory employer and employee contributions are legally mandated under the EPF Act 1991", "Only if the company is listed on Bursa Malaysia", "Only if the employee requests it in writing"], "answer": 1, "explanation": "Under the EPF Act 1991, statutory retirement contributions are compulsory for all employees."},
    {"q": "What is the purpose of SOCSO (PERKESO) contributions?", "options": ["Providing workplace injury, disability, and occupational disease protection for employees", "Paying for company annual dinners", "Investing in government sovereign bonds", "Funding foreign holidays"], "answer": 0, "explanation": "SOCSO provides social security and disability protection against employment injuries."},
    {"q": "What does EIS (SIP) stand for in Malaysian employment regulations?", "options": ["Employee Insurance Scheme (Sistem Insurans Pekerjaan)", "Enterprise Internet Service", "Export Import Standards", "Environmental Inspection System"], "answer": 0, "explanation": "EIS provides temporary financial assistance and job re-training for retrenched workers."},
    {"q": "What is the official halal certifying body in Malaysia?", "options": ["SIRIM Berhad", "Jabatan Kemajuan Islam Malaysia (JAKIM)", "Consumer Association of Penang", "Bursa Malaysia"], "answer": 1, "explanation": "JAKIM is the official national Islamic authority issuing recognized Halal certifications in Malaysia."},
    {"q": "If a startup operates from a residential home selling via postage only, must they follow local council home-business guidelines?", "options": ["Yes, councils have specific home-based business circulars and packaging regulations", "No, home-based businesses are immune to all laws", "Only if they have over 50 cats", "Only if they export to Singapore"], "answer": 0, "explanation": "Many PBTs have specific guidelines regulating home-based micro-businesses and safety."}
  ]}',
  2,
  15
);

-- ==============================================================================
-- 7. MODULE 4: Launch Execution & Capstone Submission
-- ==============================================================================

-- Lesson 4.1: Comprehensive Final Examination (40 Questions, 80% passing score)
INSERT INTO course_contents (lesson_id, title, content_type, content_body, sort_order, duration_sec)
VALUES
(
  'b2000000-0000-0000-0000-000000000007',
  'Final Comprehensive Examination: Startup Launch Essentials (40 Questions)',
  'quiz',
  '{"pass_pct": 80, "is_final_exam": true, "questions": [
    {"q": "1. What is the foundational starting point for a high-potential startup?", "options": ["Registering a Sdn Bhd company immediately", "Identifying a validated, painful customer problem", "Printing shiny glossy business cards", "Designing a fancy logo on Canva"], "answer": 1, "explanation": "Real startups begin by uncovering and validating genuine customer pain points."},
    {"q": "2. In customer discovery, why is the ''Mom Test'' methodology critical?", "options": ["It guarantees your family will invest seed capital", "It prevents polite, false validation by focusing on past behavior rather than opinions", "It requires your mother to sign your legal contracts", "It only allows women founders to participate"], "answer": 1, "explanation": "Focusing on past actions yields genuine behavioral evidence instead of polite praise."},
    {"q": "3. Which of the following describes an ''idea-first'' founder trap?", "options": ["Interviewing 20 customers before writing any code", "Building a complex app based on personal assumptions without customer validation", "Calculating unit economics before signing a lease", "Checking whether competitors already exist"], "answer": 1, "explanation": "Building before validating market demand is the classic idea-first mistake."},
    {"q": "4. What is the primary purpose of the F.P.C.U. Problem Severity Matrix?", "options": ["To prove to a bank that you will make RM1 million", "To prioritize and rank which customer pain points are worth solving", "To register a patent with MyIPO", "To calculate employee income tax"], "answer": 1, "explanation": "F.P.C.U. serves as an analytical prioritization tool for problem discovery."},
    {"q": "5. What are the 5 core discovery questions when investigating a customer problem?", "options": ["Who, What, When, How Frequently, and Current Alternatives", "Name, IC number, Bank balance, Salary, and Address", "Company name, Director, Secretary, Auditor, and Shares", "TikTok handle, Instagram followers, Phone model, and Wifi speed"], "answer": 0, "explanation": "Who has it, What is it, When does it happen, How often, and What is the current workaround."},
    {"q": "6. In customer discovery interviews, what should you do if an interviewee shares an unexpected problem?", "options": ["Interrupt them immediately and steer them back to your slide deck", "Listen attentively and dig deeper into their unexpected experience", "End the call and delete their notes", "Tell them their problem is foolish"], "answer": 1, "explanation": "Unexpected insights are often where the most lucrative startup pivots originate."},
    {"q": "7. What is the minimum recommended customer interview sample size in Module 1?", "options": ["1 interview", "5 to 10 interviews", "500 interviews", "Zero interviews"], "answer": 1, "explanation": "5 to 10 qualitative interviews provide sufficient patterns to detect recurring themes."},
    {"q": "8. In the Value Proposition formula, what is the ''reason to believe''?", "options": ["Your company logo design", "The credible evidence, mechanism, or proof that your product actually delivers its promise", "A recommendation letter from your school teacher", "A newspaper article about another company"], "answer": 1, "explanation": "Reason to believe is the proof or technical mechanism that justifies customer confidence."},
    {"q": "9. If 8 out of 10 interviewees report that existing free solutions work perfectly for them, your problem hypothesis is:", "options": ["Validated and ready for large scale manufacturing", "Disproved as a high-urgency commercial opportunity", "Guaranteed to receive a government grant", "Ready for an IPO"], "answer": 1, "explanation": "If customers are content with free alternatives, commercial viability is low."},
    {"q": "10. What is a ''Painkiller'' product compared to a ''Vitamin''?", "options": ["A regulated prescription medicine", "A solution addressing an urgent, high-friction pain that customers actively pay to eliminate", "A product endorsed by fitness influencers", "A business with negative gross margins"], "answer": 1, "explanation": "Painkillers address acute, non-optional needs that customers must solve."},
    
    {"q": "11. How many building blocks comprise the Business Model Canvas?", "options": ["4", "7", "9", "12"], "answer": 2, "explanation": "The Osterwalder Business Model Canvas contains 9 structural building blocks."},
    {"q": "12. In the Business Model Canvas, what does the ''Channels'' block describe?", "options": ["Television stations only", "How your value proposition is communicated, sold, and delivered to customer segments", "The legal jurisdiction of your company", "The internal payroll software used for employees"], "answer": 1, "explanation": "Channels represent all discovery, purchase, delivery, and post-purchase touchpoints."},
    {"q": "13. In Malaysia, selling through TikTok Shop, WhatsApp, and weekend pop-up bazaars represents:", "options": ["Omnichannel sales and distribution strategies", "Sole proprietorship registration forms", "Direct government grants", "Corporate secretary procedures"], "answer": 0, "explanation": "Combining digital marketplaces with messaging and popups is an omnichannel strategy."},
    {"q": "14. What are ''Key Resources'' in a Business Model Canvas?", "options": ["The raw materials, intellectual property, facilities, and staff required to operate the model", "The customers who visit your website", "The government ministers in charge of commerce", "The competitor companies in your industry"], "answer": 0, "explanation": "Key Resources are the critical assets necessary to create and deliver value."},
    {"q": "15. How does a startup identify its ''Key Partners''?", "options": ["By asking all family members to become co-owners", "By identifying third-party suppliers, delivery partners, and platforms essential to operations", "By hiring 100 full-time employees", "By buying shares on Bursa Malaysia"], "answer": 1, "explanation": "Key partners are external entities (suppliers, couriers, payment processors) that enable the business model."},
    {"q": "16. What is the definition of ''Cost Structure'' in the BMC?", "options": ["All costs incurred to operate the business model (both fixed and variable)", "The price of the product displayed on the shelf", "The bank account opening fee only", "The salary of the CEO only"], "answer": 0, "explanation": "Cost structure maps the monetary costs of running all parts of the business model."},
    {"q": "17. What is a recurring revenue stream?", "options": ["A one-time cash sale that never repeats", "Predictable, ongoing income generated on a periodic basis (e.g. monthly subscriptions or retainers)", "An emergency overdraft from a commercial bank", "Selling old office equipment at a loss"], "answer": 1, "explanation": "Recurring revenues repeat periodically, providing cash flow stability."},
    {"q": "18. What is the main purpose of mapping ''Customer Relationships''?", "options": ["To invite customers to wedding ceremonies", "To define how you acquire, retain, and grow value with your customer segment", "To spy on personal customer telephone calls", "To avoid paying sales tax"], "answer": 1, "explanation": "Customer Relationships outline acquisition, retention, and loyalty strategies."},
    {"q": "19. Can a company operate with more than one Revenue Stream?", "options": ["No, Malaysian law limits businesses to one product", "Yes, businesses often combine direct product sales, subscriptions, and service fees", "Only if approved by Parliament", "Only after 20 years of continuous operation"], "answer": 1, "explanation": "Multiple revenue streams diversify risk and maximize customer lifetime value."},
    {"q": "20. Why should the Business Model Canvas be updated regularly after market launch?", "options": ["Because old paper becomes dusty", "Because real customer data, supplier pricing, and competition necessitate continuous adaptation", "Because SSM inspects the canvas every Monday", "Because software updates delete previous files"], "answer": 1, "explanation": "A business model is a living document that must evolve with market feedback."},

    {"q": "21. What is the mathematical definition of Contribution Margin per unit?", "options": ["Selling Price + Cost of Goods Sold", "Selling Price − Total Variable Cost per unit", "Total Fixed Costs / Total Employees", "Net Profit after 24% Corporate Tax"], "answer": 1, "explanation": "Contribution Margin per unit is Selling Price minus Variable Cost per unit."},
    {"q": "22. Which of the following is an example of a Variable Cost for an online clothing retailer?", "options": ["Monthly warehouse rental lease of RM 3,000", "Polymailer courier packaging and shipping fee per parcel", "Annual domain name registration of RM 60", "Business insurance premium paid yearly"], "answer": 1, "explanation": "Polymailer bags and shipping costs are incurred only when an item is ordered and dispatched."},
    {"q": "23. If a product sells for RM 80.00 and has variable costs of RM 30.00, what is the Contribution Margin?", "options": ["RM 110.00", "RM 50.00", "RM 2.66", "RM 2,400.00"], "answer": 1, "explanation": "RM 80.00 − RM 30.00 = RM 50.00."},
    {"q": "24. If monthly fixed costs are RM 10,000 and the Contribution Margin per unit is RM 50, what is the monthly breakeven volume?", "options": ["50 units", "100 units", "200 units", "500 units"], "answer": 2, "explanation": "Breakeven Volume = RM 10,000 / RM 50 = 200 units."},
    {"q": "25. What does the Breakeven Point represent for a business?", "options": ["The point where total revenues exactly equal total costs (zero profit, zero loss)", "The point where the founder becomes a billionaire", "The date when the company is legally dissolved", "The maximum limit of bank debt allowed"], "answer": 0, "explanation": "Breakeven is the operational milestone where total revenues cover all costs with zero net balance."},
    {"q": "26. What happens if an entrepreneur sets a selling price lower than the variable cost per unit?", "options": ["The business makes a fortune through high volume", "Every single unit sold generates an immediate cash loss (negative unit economics)", "The government pays the difference in subsidies", "Fixed costs automatically drop to zero"], "answer": 1, "explanation": "Selling below variable cost means every sale drains cash and accelerates bankruptcy."},
    {"q": "27. What is the Contribution Margin Ratio if selling price is RM 200 and Contribution Margin is RM 80?", "options": ["20%", "40%", "80%", "120%"], "answer": 1, "explanation": "CM Ratio = RM 80 / RM 200 = 0.40 or 40%."},
    {"q": "28. If your monthly fixed costs increase from RM 4,000 to RM 6,000 while CM per unit stays constant, what happens to breakeven volume?", "options": ["Breakeven volume decreases", "Breakeven volume increases", "Breakeven volume stays identical", "Breakeven volume drops to zero"], "answer": 1, "explanation": "Higher fixed overhead requires more unit sales to reach the breakeven threshold."},
    {"q": "29. What is the difference between Gross Profit and Contribution Margin?", "options": ["There is zero difference between them", "Gross Profit considers standard COGS; Contribution Margin deducts ALL variable costs including packaging, commission, and delivery", "Gross profit is only used by non-profit charities", "Contribution margin is only calculated once every 10 years"], "answer": 1, "explanation": "CM accounts for all variable costs (including sales commissions, shipping, and packaging)."},
    {"q": "30. Why is calculating breakeven volume essential before signing a commercial shop lease?", "options": ["To verify whether daily customer footfall can realistically achieve the required monthly sales volume", "To show the landlord photos of your family", "Because commercial leases are illegal without bank loans", "To avoid paying electricity tariffs"], "answer": 0, "explanation": "Understanding breakeven prevents committing to fixed leases that the business cannot sustain."},

    {"q": "31. What is the minimum age to register a Sole Proprietorship with SSM in Malaysia?", "options": ["16 years old", "18 years old", "21 years old", "25 years old"], "answer": 1, "explanation": "The legal age requirement under the Registration of Businesses Act 1956 is 18 years old."},
    {"q": "32. What is the annual SSM registration renewal fee for a business registered using a Trade Name (e.g. ''Kopi Nusantara'')?", "options": ["RM 30 / year", "RM 60 / year", "RM 300 / year", "RM 1,200 / year"], "answer": 1, "explanation": "Trade names cost RM60 annually, while personal names cost RM30 annually."},
    {"q": "33. What is the primary characteristic of a Sole Proprietorship (Pemilikan Tunggal)?", "options": ["The company is a separate legal person from the founder", "The owner has unlimited personal liability for all business debts", "The company must appoint a licensed company secretary", "The company can sell publicly traded shares on Bursa Malaysia"], "answer": 1, "explanation": "In a sole proprietorship, the owner and the business are legally identical, creating unlimited personal liability."},
    {"q": "34. What form must be submitted to reserve a Trade Name with SSM?", "options": ["Borang PNA42", "Borang 49", "Borang 24", "Borang EA"], "answer": 0, "explanation": "Borang PNA42 is the official trade name reservation form under ROBA 1956."},
    {"q": "35. What is the official web portal for online business registrations under SSM in Malaysia?", "options": ["SSM EzBiz (ezbiz.ssm.com.my)", "JPJ MySikap", "LHDN e-Daftar", "EPF i-Akaun"], "answer": 0, "explanation": "SSM EzBiz is the official registration portal for ROBA sole proprietorships and partnerships."},
    {"q": "36. In addition to SSM registration, what permit is required to display a physical commercial signboard outside a shop?", "options": ["Signboard License (Lesen Papan Tanda) from the local municipal council (PBT)", "Approval from the United Nations", "A permit from the Department of Civil Aviation", "A letter of permission from your bank"], "answer": 0, "explanation": "Local authorities (PBTs) regulate and issue premise and advertisement/signboard licenses."},
    {"q": "37. What statutory organization manages compulsory retirement savings contributions for employees in Malaysia?", "options": ["KWSP (Employees Provident Fund / EPF)", "PERKESO (SOCSO)", "LHDN (Inland Revenue Board)", "Bank Simpanan Nasional (BSN)"], "answer": 0, "explanation": "KWSP/EPF manages retirement savings under the EPF Act 1991."},
    {"q": "38. What does SOCSO (PERKESO) primarily provide for employees in Malaysia?", "options": ["Free airline tickets for holidays", "Protection, medical benefits, and compensation for employment-related injuries and invalidity", "Low-interest housing mortgages", "Free company cars"], "answer": 1, "explanation": "SOCSO provides statutory social security protection against workplace accidents and illnesses."},
    {"q": "39. What tax form must Sole Proprietors submit annually to LHDN to report business income?", "options": ["Borang B", "Borang BE", "Borang C", "Borang P"], "answer": 0, "explanation": "Borang B is submitted by individuals with business income (deadline: 30 June)."},
    {"q": "40. What is the minimum score required to pass this comprehensive micro-credential examination?", "options": ["50%", "60%", "70%", "80% (32 out of 40 questions)"], "answer": 3, "explanation": "An 80% score (32/40 correct) is required to pass the SPM-LMS-MC-001 final examination."}
  ]}',
  1,
  60
);

-- Lesson 4.2: Capstone Project: Startup Launch Portfolio Submission
INSERT INTO course_contents (lesson_id, title, content_type, content_body, sort_order, duration_sec)
VALUES
(
  'b2000000-0000-0000-0000-000000000008',
  'Capstone Project Guidelines: Startup Launch Portfolio',
  'assignment',
  '<div class="prose max-w-none space-y-4">
    <h3>Capstone Project: Startup Launch Portfolio</h3>
    <p>To graduate with the <strong>Startup Launch Essentials — Malaysia</strong> micro-credential, you must synthesize your learning across all four modules into a cohesive, submission-ready <strong>Startup Launch Portfolio</strong>.</p>
    
    <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
      <h4 class="font-bold text-slate-900 text-sm">Required Portfolio Artifacts (Submit as single PDF or document package):</h4>
      <ol class="list-decimal pl-5 text-xs space-y-2 text-slate-700">
        <li><strong>Artifact 1: Customer Validation Summary & Discovery Log:</strong>
          <ul class="list-disc pl-4 mt-1 text-slate-600">
            <li>Target Customer Avatar description (Demographics, location, income bracket).</li>
            <li>Summary log of 5 real customer discovery interviews conducted.</li>
            <li>Synthesis table: Confirmed, Uncertain, and Disproved findings.</li>
          </ul>
        </li>
        <li><strong>Artifact 2: Complete 9-Block Business Model Canvas:</strong>
          <ul class="list-disc pl-4 mt-1 text-slate-600">
            <li>Completed BMC incorporating all 9 building blocks localized for Malaysia.</li>
            <li>Clear Value Proposition Statement using the standard formula.</li>
          </ul>
        </li>
        <li><strong>Artifact 3: Unit Economics & Monthly Breakeven Model:</strong>
          <ul class="list-disc pl-4 mt-1 text-slate-600">
            <li>Itemized Selling Price and Variable Costs (COGS, packaging, payment fees).</li>
            <li>Contribution Margin and Contribution Margin Ratio.</li>
            <li>Itemized Monthly Fixed Costs (rent, utilities, software, marketing).</li>
            <li>Calculated Breakeven Point in units and sales revenue.</li>
          </ul>
        </li>
        <li><strong>Artifact 4: SSM Registration Draft & Compliance Checklist:</strong>
          <ul class="list-disc pl-4 mt-1 text-slate-600">
            <li>Chosen business entity type with justification (e.g. Sole Prop vs Sdn Bhd).</li>
            <li>Draft Borang A details (Proposed business name, MSIC business activity codes).</li>
            <li>List of relevant PBT local council and sectoral licenses required.</li>
          </ul>
        </li>
        <li><strong>Artifact 5: 30-Day Go-To-Market Launch Plan:</strong>
          <ul class="list-disc pl-4 mt-1 text-slate-600">
            <li>Week 1: Legal registration & channel setup (SSM, bank account, DuitNow QR).</li>
            <li>Week 2: Minimum Viable Product (MVP) preparation & packaging test.</li>
            <li>Week 3: Soft launch to initial 10 customers & feedback gathering.</li>
            <li>Week 4: Official commercial launch & customer acquisition campaign.</li>
          </ul>
        </li>
      </ol>
    </div>

    <div class="p-3 bg-amber-50 border-l-4 border-amber-600 text-xs text-amber-900 mt-3">
      <strong>Evaluation Standard:</strong> This capstone is assessed using a 100-point performance rubric (25 pts per core criterion). A passing mark of <strong>80% or higher</strong> is mandatory to unlock your accredited certificate.
    </div>
  </div>',
  1,
  120
);

-- ==============================================================================
-- 8. Seed Capstone in practical_assessments Table
-- ==============================================================================

INSERT INTO practical_assessments (
  id,
  course_id,
  title,
  instructions,
  required_evidence_types,
  max_score,
  pass_mark,
  rubrics
)
VALUES (
  'e2000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000001',
  'Startup Launch Portfolio: Capstone Project',
  'Submit your complete 5-part Startup Launch Portfolio (Customer Discovery Log, Business Model Canvas, Unit Economics & Breakeven Model, SSM Borang A Draft, and 30-Day Go-To-Market Roadmap).',
  ARRAY['document', 'pdf'],
  100.00,
  80.00,
  '[
    {
      "criterion": "1. Customer Validation & Problem Evidence",
      "max_points": 25,
      "description": "Evidence of 5 structured interviews, separation of assumption from fact, and clear problem-solution fit formulation."
    },
    {
      "criterion": "2. Business Model Canvas Completeness",
      "max_points": 25,
      "description": "All 9 building blocks logically aligned with realistic Malaysian channels, customer relationships, and revenue streams."
    },
    {
      "criterion": "3. Unit Economics & Breakeven Financial Modeling",
      "max_points": 25,
      "description": "Accurate calculation of Price, COGS, Variable Costs, Contribution Margin, and realistic monthly Breakeven Volume."
    },
    {
      "criterion": "4. Regulatory Compliance & 30-Day Launch Execution",
      "max_points": 25,
      "description": "Complete SSM Borang A draft, PBT/sectoral licensing awareness, statutory duties (LHDN/KWSP/PERKESO), and structured week-by-week launch plan."
    }
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  instructions = EXCLUDED.instructions,
  rubrics = EXCLUDED.rubrics,
  pass_mark = EXCLUDED.pass_mark;
