# SpectrumMY Programme & Learning Management System

> **Learn. Participate. Perform. Measure.**

A production-ready full-stack web application for managing SpectrumMY programme operations, learning content, participant records, events, attendance, KPIs, and reporting.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| UI | React 19 + Vanilla CSS (design tokens) |
| Backend/API | Next.js Server Actions + Server Components |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth (Email + Password) |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime (Phase 7+) |
| Charts | Recharts |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |
| Hosting | Hostinger Cloud |

---

## Project Structure

```
spectrummy/
├── app/
│   ├── (auth)/          ← Login, Forgot Password
│   ├── (dashboard)/     ← All protected pages
│   ├── verify/          ← Public certificate verification
│   └── globals.css      ← Complete design system
├── components/
│   ├── layout/          ← Sidebar, Topbar, Dashboard Shell
│   └── dashboard/       ← KPI cards, charts, filters
├── utils/
│   └── supabase/        ← Browser, Server, Middleware clients
├── supabase/
│   └── migrations/      ← SQL migration files
├── middleware.ts         ← Route protection
└── .env.local.example   ← Environment variable template
```

---

## Quick Start

### 1. Install Dependencies

```bash
cd spectrummy
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

> ⚠️ Never commit `.env.local` to Git. It is in `.gitignore`.

### 3. Set Up Database

Run the migrations in your Supabase project's SQL Editor **in order**:

1. `supabase/migrations/0001_initial_schema.sql` — Full normalized schema + RLS
2. `supabase/migrations/0002_seed_data.sql` — Demo data (states, NADI, programmes, events, KPIs)

### 4. Create Initial Admin User

In Supabase Dashboard → Authentication → Users, create a user with your email and password.

Then in the SQL Editor, promote them to Super Admin:

```sql
UPDATE profiles
SET role = 'super_admin', full_name = 'System Administrator'
WHERE id = 'your-user-uuid-here';
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to `/login`.

---

## Database Schema

### Core Tables

| Table | Purpose |
|---|---|
| `states` | 16 Malaysian states |
| `nadi_sites` | NADI community centres |
| `profiles` | Extends Supabase auth.users |
| `programmes` | Programme definitions |
| `programme_modules` | Modules within a programme |
| `lessons` | Lessons/topics within a module |
| `lesson_contents` | Content blocks (video, PDF, quiz, etc.) |
| `participants` | Participant records |
| `participant_programmes` | Programme enrolments |
| `trainers` | Trainer profiles |
| `events` | Programme events |
| `event_sessions` | Sessions within an event |
| `event_participants` | Event registrations |
| `attendance` | Attendance records |
| `learning_progress` | Learning tracking |
| `quizzes` + `quiz_questions` | Quiz engine |
| `quiz_attempts` + `quiz_answers` | Quiz submissions |
| `assessments` + `assessment_results` | Formal assessments |
| `certificates` | Issued certificates |
| `certificate_templates` | Certificate designs |
| `media` | Media repository |
| `kpis` + `kpi_targets` + `kpi_results` | KPI management |
| `audit_logs` | System audit trail |
| `system_settings` | Configurable settings |
| `reports` | Saved report configurations |

---

## Role & Permission System

| Role | Access Level |
|---|---|
| `super_admin` | Full system access |
| `programme_admin` | Manage programmes, participants, events, reports |
| `nadi_admin` | Manage their assigned NADI site |
| `state_admin` | View/manage their state data |
| `trainer` | Manage their sessions and attendance |
| `registrar` | Manage participant registrations |
| `observer` | Read-only access |

Permissions are enforced via **Supabase Row Level Security** — not just frontend UI checks.

---

## Pre-loaded Programmes

### eKelas Pelajar
- Module 1: eKelas Portal (8 subjects)
- Module 2: GenAI for Education (6 topics)
- Module 3: Problem Solving & Critical Thinking (6 topics)

### eKelas Usahawan
- Module 1: Design Bootcamp (8 topics)
- Module 2: Digital Marketing (4 topics)

### AI WIRA
- Module 1: AI Fundamentals (4 topics)
- Module 2: AI in Daily Life (3 topics)
- Module 3: AI for Community (3 topics)

---

## Public Routes

| Route | Description |
|---|---|
| `/login` | User login |
| `/forgot-password` | Password reset |
| `/verify/[certificateNumber]` | Certificate verification |
| `/about` | About SpectrumMY (planned) |

---

## Development Phases

| Phase | Status | Description |
|---|---|---|
| 1 — Foundation | ✅ Complete | Auth, layout, DB schema, RLS, dashboard |
| 2 — Master Data | 🔵 Next | NADI, Programme, Module, Lesson CRUD |
| 3 — Programme Ops | ⬜ Queued | Events, sessions, registration, attendance |
| 4 — LMS | ⬜ Queued | Content builder, video, quiz, progress |
| 5 — Certificates | ⬜ Queued | Certificate engine + QR verification |
| 6 — Media | ⬜ Queued | Media repository + metadata |
| 7 — KPI & Analytics | ⬜ Queued | Live KPI + advanced analytics |
| 8 — Reporting | ⬜ Queued | Report engine + PDF/Excel export |
| 9 — Hardening | ⬜ Queued | Security, performance, deployment |

---

## Environment Variables Reference

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=           # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY= # Your publishable key (safe for browser)

# Server-side only (do NOT expose to browser)
# SUPABASE_SERVICE_ROLE_KEY=        # Only for admin server actions (Phase 3+)
```

---

## Security

- All routes except `/login`, `/forgot-password`, `/verify/*` require authentication
- Authentication enforced in `middleware.ts` (server-side)
- Database access controlled by **Supabase Row Level Security (RLS)**
- Observer role is read-only at the database level — not just UI
- File access via signed URLs (not public storage)
- No service role keys exposed to browser
- Audit log records all important actions

---

## Certificate Verification

Public URL: `/verify/[certificateNumber]`

Example: `/verify/SpectrumMY-2026-000001`

No authentication required. Uses a public-safe database query.

---

## Deployment (Hostinger Cloud)

1. Build the application: `npm run build`
2. Set environment variables on Hostinger server
3. Start with: `npm run start` or configure PM2
4. Point domain to the Next.js server

---

## Contributing

This is a single-organization internal system. For changes:

1. Create a feature branch
2. Implement changes
3. Write/update migration if schema changes
4. Test locally
5. PR to main
6. Run migrations on production DB before deploying

---

## Support

For technical support or system administration queries:  
📧 admin@spectrummy.gov.my
