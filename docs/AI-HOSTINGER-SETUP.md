# Hostinger AI Router & n8n Automation Setup Guide

## Spectrum Malaysia LMS Platform

This document outlines the architecture, configuration, and security practices for operating the **Central AI Gateway**, **Hostinger AI Router**, and **Hostinger n8n Automation Engine** within the Spectrum Malaysia LMS ecosystem.

---

## 1. Architectural Overview

```text
User / Learner / Trainer
         ↓
Spectrum Malaysia LMS (Next.js on Hostinger Cloud)
         ↓
  Central AI Service (services/ai-gateway.ts)
         ↓
  Provider Hierarchy:
    1. Feature-Specific Model
    2. Global Default Model
    3. Fallback Model
    4. Free-First / Simulation Mode (Default Active, Zero-Cost)
         ↓
[Free Local (Ollama) | Hostinger AI Router | OpenAI | Gemini | Anthropic | Simulation]
```

### Automation Layer

```text
LMS Server Event (Course Completion / Credential Issuance / Alert)
         ↓
Server-to-Server Authenticated Webhook (HMAC-SHA256)
         ↓
Hostinger n8n Engine (workflows & external triggers)
         ↓
Async Job Recorded in LMS (`n8n_jobs` table)
```

---

## 2. Free-First AI Principle

- **Simulation Mode** is active by default. It generates high-fidelity, contextual pedagogical responses and course outlines with zero external network dependencies and **zero cost**.
- **Paid external AI providers are OFF by default**. No unexpected billing can occur without explicit administrative activation.
- If an external provider runs out of tokens, encounters a rate limit, or reaches the monthly budget cap (`ai_budgets`), the system **automatically falls back to simulation mode** without interrupting the user.

---

## 3. Environment Variables Configuration

In Hostinger Cloud (hPanel $\rightarrow$ Cloud Hosting / VPS $\rightarrow$ Environment Variables), configure:

```bash
# -------------------------------------------------------------------
# Supabase Configuration
# -------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL="https://atomajdzjzppxamdabjz.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="<your-supabase-publishable-key>"
SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key-server-only>"

# -------------------------------------------------------------------
# Hostinger AI Router Configuration
# -------------------------------------------------------------------
AI_ROUTER_ENDPOINT="https://ai-router.hostinger.com/v1"
AI_ROUTER_API_KEY="<your-hostinger-ai-router-token>"

# -------------------------------------------------------------------
# Hostinger n8n Automation Engine
# -------------------------------------------------------------------
N8N_BASE_URL="https://automation.spectrum.my"
N8N_WEBHOOK_SECRET="<generate-random-64-char-secret>"

# -------------------------------------------------------------------
# Optional External Providers (OFF by Default)
# -------------------------------------------------------------------
OPENAI_API_KEY=""
GEMINI_API_KEY=""
ANTHROPIC_API_KEY=""
XAI_API_KEY=""
```

> [!CAUTION]
> **API Key Protection**: Never add `NEXT_PUBLIC_` prefix to AI keys or webhook secrets. All AI calls must originate server-side from `services/ai-gateway.ts`.

---

## 4. Configuring Hostinger AI Router

1. Log into your **Hostinger Cloud Dashboard (hPanel)**.
2. Navigate to **AI Services** / **API Management**.
3. Generate an **AI Router API Key** and set permissions for text inference.
4. Add `AI_ROUTER_API_KEY` to your environment variables.
5. In SpectrumMY LMS, navigate to **Administration $\rightarrow$ AI Platform $\rightarrow$ Hostinger Router** (`/admin/ai/router`).
6. Click **Ping Router** to verify connectivity.
7. Under **AI Providers** (`/admin/ai/providers`), click **Enable** next to Hostinger AI Router to make it available for feature routing.

---

## 5. Configuring Hostinger n8n Automation

1. Deploy or access your Hostinger n8n container / instance (e.g. `https://automation.spectrum.my`).
2. Create a new workflow with a **Webhook Trigger node**:
   - **HTTP Method**: `POST`
   - **Path**: `webhook/spectrum-events`
   - **Authentication**: Header Auth using header `X-Spectrum-Signature` matching `N8N_WEBHOOK_SECRET`.
3. In SpectrumMY LMS, navigate to **Administration $\rightarrow$ n8n Automation** (`/admin/settings/n8n`).
4. Enter your instance URL and click **Ping Server**.
5. Enable the toggle: **"Enable server-side asynchronous webhook dispatching to n8n"**.
6. The LMS will dispatch events (`course_completed`, `credential_issued`, `intervention_flagged`) with payload contract:
   ```json
   {
     "requestId": "n8n-req-1726500000000-xyz123",
     "timestamp": "2026-09-16T22:30:00.000Z",
     "event": "credential_issued",
     "source": "spectrum-malaysia-lms",
     "userId": "usr_998",
     "featureCode": "credential_engine",
     "payload": {
       "credentialId": "SPM-MC-2026-000042",
       "recipientName": "Muhammad Amirul"
     }
   }
   ```

---

## 6. Testing & Sandboxing

- Navigate to **Administration $\rightarrow$ AI Platform $\rightarrow$ AI Test Console** (`/admin/ai/test`).
- Select a feature (e.g. `ai_learner_assistant`), target provider, and temperature.
- Click **Run Test Prompt**.
- Inspect latency (ms), token volume, active model, and cost telemetry.

---

## 7. Credential Rotation & Emergency Disabling

- To immediately disconnect an AI provider:
  Navigate to `/admin/ai/providers` and toggle **Disable**. The system instantly shifts all requests to the next active provider or Simulation Mode without requiring an application redeployment.
- To rotate secrets:
  Update the environment variable in hPanel, then trigger a zero-downtime container restart.
