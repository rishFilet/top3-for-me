# PRD: Top3 — A Tiny Daily Operating System

**Author:** Rishi Khan
**Date:** 2026-04-28
**Status:** Draft
**Version:** 1.0
**Taskmaster Optimized:** Yes

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Goals & Success Metrics](#goals--success-metrics)
4. [User Stories](#user-stories)
5. [Functional Requirements](#functional-requirements)
6. [Non-Functional Requirements](#non-functional-requirements)
7. [Technical Considerations](#technical-considerations)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Out of Scope](#out-of-scope)
10. [Open Questions & Risks](#open-questions--risks)
11. [Validation Checkpoints](#validation-checkpoints)
12. [Appendix: Task Breakdown Hints](#appendix-task-breakdown-hints)

---

## Executive Summary

Top3 is a minimalist daily operating system — not a planner — designed to translate sluggish, anxious mornings into a calm, executable day. The web app captures three "enough" priorities, a tiny morning/evening routine, a weekly rhythm of comedy/rest nights, and a 60-second reflection, then mirrors a simplified "today card" to an ESP32 e‑ink display. The product targets users (especially ADHD-leaning creatives and comics) who have failed with bloated tools and need a calm, sub-2-minute daily interface backed by a clean data model that supports a future AI coaching layer.

---

## Problem Statement

### Current Situation
Existing planners (Notion, Todoist, Things) reward capture and maintenance, not execution. They produce ever-growing backlogs that intensify the cognitive overwhelm they were supposed to solve. Habit trackers are either too gamified or too feature-heavy to survive a low-energy morning. Nothing on the market combines a "what is enough today" frame with a calm ambient e‑ink output.

### User Impact
- **Who is affected:** Adults with high-variance energy/attention (ADHD, creatives, performers), specifically those who juggle knowledge work with evening creative commitments (comedy mics, music, writing).
- **How they're affected:** Mornings start with vague dread; they cannot name "enough"; evenings collapse without closing loops; they default to over-committing or freezing.
- **Severity:** High — chronic, daily, compounding into burnout and missed creative practice.

### Business Impact
- **Cost of problem:** Lost creative output, abandoned subscriptions to bloated tools, persistent anxiety that bleeds into work quality.
- **Opportunity cost:** Every day without a "today is enough if…" frame, users default to capture-mode tools that make the problem worse.
- **Strategic importance:** Foundation for an AI coaching product whose value depends on structured daily history (DayPlan + ReflectionEntry), not chat logs.

### Why Solve This Now?
ESP32 e‑ink hardware is now cheap and well-documented; LLMs are now capable enough to coach against structured personal data; and the user (primary builder) has acute personal need plus daily testing capability.

---

## Goals & Success Metrics

### Goal 1: Sustainable Daily Use
- **Description:** User completes a morning check-in 5+ days/week.
- **Metric:** Days/week with a saved DayPlan containing 3 priorities + night_mode.
- **Baseline:** 0 (no product exists).
- **Target:** 5/7 days within 4 weeks of MVP launch (single-user).
- **Timeframe:** 4 weeks post-MVP.
- **Measurement:** DayPlan creation count from DB.

### Goal 2: Sub-2-Minute Plan Time
- **Description:** Morning planning takes under 2 minutes.
- **Metric:** Time from app open to "Send to display" tap.
- **Baseline:** N/A.
- **Target:** Median ≤ 90 seconds; p95 ≤ 150 seconds.
- **Timeframe:** Measured continuously after launch.
- **Measurement:** Client-side timing event from app_open → display_sent.

### Goal 3: E‑Ink Mirror Reliability
- **Description:** The e‑ink device reflects today's plan within 60 seconds of "Send to display."
- **Metric:** End-to-end latency from tap to render; uptime of display endpoint.
- **Baseline:** N/A.
- **Target:** ≥ 99% sync success; median latency < 60s (next poll cycle).
- **Timeframe:** From device launch.
- **Measurement:** Device sync logs + endpoint hit logs.

### Goal 4: Reflection Capture
- **Description:** Evening reflection captured 4+ nights/week to enable future AI coaching.
- **Metric:** ReflectionEntry rows/week.
- **Target:** 4/7 within 6 weeks.
- **Measurement:** DB row count.

---

## User Stories

### Story 1: Morning Plan in Under 2 Minutes

**As a** user waking up sluggish,
**I want to** declare three "enough" priorities and see my morning ramp,
**So that I can** start the day with a regulated, executable shape rather than vague dread.

**Acceptance Criteria:**
- [ ] Today screen loads with date, weekday, and energy selector visible above the fold.
- [ ] Three priority text fields are editable inline; pre-filled with last day's draft only if user opts in.
- [ ] Tonight mode selector (mic / light / rest / open) is visible and one tap.
- [ ] Morning routine card auto-renders (time-of-day aware: morning before 14:00 local).
- [ ] "Send to display" button is the single primary CTA on screen.
- [ ] Total interaction count from open → send ≤ 8 taps for a typical day.

**Task Breakdown Hint:**
- Task 1.1: Today screen layout + date/weekday header (3h)
- Task 1.2: Energy 3-state selector component (2h)
- Task 1.3: Three-priority editable card (4h)
- Task 1.4: Night mode selector (2h)
- Task 1.5: Time-aware routine card switcher (3h)
- Task 1.6: Send-to-display action + DayPlan persistence (4h)

**Dependencies:** REQ-001 (DayPlan API), REQ-003 (Routines API)

---

### Story 2: Re-center Mid-Day

**As a** user feeling scattered at 2pm,
**I want to** open the app and see only today's three priorities and tonight's mode,
**So that I can** decide what's still essential without being pulled into a backlog.

**Acceptance Criteria:**
- [ ] Tapping a priority toggles done state.
- [ ] User can replace any priority text inline.
- [ ] One "Not today" capture field accepts a single line and stores it on the DayPlan.
- [ ] When all 3 priorities are done, a subtle banner reads "Bonus territory — extra is gift, not duty."

---

### Story 3: Evening Shutdown

**As a** user closing the day after a mic,
**I want to** run a 60-second reset and log a tiny reflection,
**So that** tomorrow morning isn't hostile.

**Acceptance Criteria:**
- [ ] Evening routine card replaces morning card after a configurable cutoff (default 18:00).
- [ ] Reflection form: energy, anxiety, hit-priorities (yes/partial/no), did-routine, did-mic, free-text.
- [ ] Form submission completes in ≤ 60 seconds for a typical user (5 fields, mostly taps).
- [ ] Tomorrow's 3-bullet draft input is offered at end of reset.

---

### Story 4: Mirror to E-Ink

**As a** user with an ESP32 e‑ink display on my desk,
**I want** my today card to render passively,
**So that I** glance at the day without opening a phone.

**Acceptance Criteria:**
- [ ] `GET /api/v1/display/today` returns the DisplayPayload JSON for the authenticated device.
- [ ] Device polls every 15 minutes by default; configurable.
- [ ] Payload size ≤ 2 KB.
- [ ] Device renders date, 3 priorities, ≤ 4 routine steps, night mode label.
- [ ] If no DayPlan exists for today, payload returns a "Not planned yet" state cleanly.

---

### Story 5: Weekly Rhythm

**As a** comedian-and-knowledge-worker,
**I want to** mark which nights are mic / rest / creative / open,
**So that** my daily plan respects evening commitments.

**Acceptance Criteria:**
- [ ] Week screen shows 7 days with one tap-cycling tag per day.
- [ ] Optional one-line note per day (venue, social plan).
- [ ] Today screen reads from the WeeklyPattern when generating the default night_mode.

---

## Functional Requirements

### Must Have (P0)

#### REQ-001: DayPlan CRUD
**Description:** Create, read, update one DayPlan per user per date.

**Acceptance Criteria:**
- [ ] `POST /api/v1/day-plans` creates a plan for `{date}`; idempotent on (user_id, date).
- [ ] `GET /api/v1/day-plans/today` returns today's plan (server's interpretation of user's local TZ).
- [ ] `PATCH /api/v1/day-plans/{id}` allows partial updates to priorities, energy, night_mode, not_today.
- [ ] Priority array is exactly length 3; empty strings allowed.
- [ ] `display_sent_at` timestamp is set when display sync is triggered.

**Technical Specification:**
```typescript
interface DayPlan {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD, user-local
  energy: "low" | "medium" | "high";
  work_priorities: [string, string, string];
  priority_done: [boolean, boolean, boolean];
  night_mode: "mic" | "light" | "rest" | "open";
  not_today: string | null;
  morning_routine_id: string | null;
  evening_routine_id: string | null;
  display_sent_at: string | null; // ISO
  created_at: string;
  updated_at: string;
}
```

**Task Breakdown:**
- DB schema + migration: Small (3h)
- POST/PATCH/GET handlers: Medium (5h)
- Idempotency on (user, date): Small (2h)
- Timezone handling: Small (3h)
- Tests: Small (3h)

**Dependencies:** None.

---

#### REQ-002: Today Screen UI
**Description:** Single-screen home that surfaces date, energy, 3 priorities, night mode, time-aware routine, and send-to-display CTA.

**Acceptance Criteria:**
- [ ] Renders in < 1s on cold load on mid-tier mobile.
- [ ] Inline editing without modal dialogs.
- [ ] Time-aware routine card swap at 14:00 and 18:00 cutoffs.
- [ ] "Send to display" button shows last-sent timestamp on success.

**Task Breakdown:**
- Today route + layout: Medium (5h)
- Editable priority component: Medium (4h)
- Energy + night mode selectors: Small (3h)
- Routine card (read-only): Small (3h)
- Send-to-display action: Small (3h)

**Dependencies:** REQ-001, REQ-003.

---

#### REQ-003: Routines (Morning + Evening)
**Description:** Reusable checklists with steps that have label, duration, optional trigger, optional minimum-version.

**Acceptance Criteria:**
- [ ] User has at least one default morning and one default evening routine seeded on signup.
- [ ] Steps reorderable.
- [ ] Each step toggleable as done for the current DayPlan (state lives on DayPlan, not Routine).
- [ ] "Low-energy mode" toggle on routine substitutes the minimum-version of each step where defined.

**Technical Specification:**
```typescript
interface Routine {
  id: string;
  user_id: string;
  kind: "morning" | "evening";
  name: string;
  steps: RoutineStep[];
}
interface RoutineStep {
  id: string;
  label: string;
  duration_minutes: number | null;
  trigger: string | null; // e.g. "after water"
  minimum_version: string | null;
}
```

**Dependencies:** None.

---

#### REQ-004: Weekly Rhythm
**Description:** A WeeklyPattern stores recurring tags (mic/rest/creative/open) per weekday plus optional one-off date overrides.

**Acceptance Criteria:**
- [ ] Week screen shows current week (Mon–Sun, configurable start).
- [ ] Tap a day to cycle through the four tag values.
- [ ] One-line note per day persisted.
- [ ] DayPlan defaults `night_mode` from WeeklyPattern when first created.

**Dependencies:** REQ-001.

---

#### REQ-005: Reflection Entry
**Description:** Lightweight nightly log capturing energy, anxiety, priority hit, routine done, mic attended, free-text.

**Acceptance Criteria:**
- [ ] One entry per (user, date).
- [ ] Form completes in ≤ 60s for typical user.
- [ ] Stored in normalized form to feed future coaching.

**Schema:**
```sql
CREATE TABLE reflection_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  energy SMALLINT,         -- 1-5
  anxiety SMALLINT,        -- 1-5
  hit_priorities VARCHAR(10), -- yes|partial|no
  did_routine BOOLEAN,
  did_mic BOOLEAN,
  what_helped TEXT,
  what_hindered TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, date)
);
```

**Dependencies:** REQ-001.

---

#### REQ-006: Display Payload Endpoint
**Description:** Single GET endpoint returns a tiny, e‑ink-friendly JSON for the current user's today card. Authenticated via long-lived device token.

**Acceptance Criteria:**
- [ ] `GET /api/v1/display/today` returns ≤ 2 KB JSON.
- [ ] 200 with `{ "state": "not_planned" }` if no plan exists today.
- [ ] Auth via `Authorization: Bearer <device_token>` (separate from user JWT, scope = display:read).
- [ ] `ETag` header set; device may use `If-None-Match` and receive 304.
- [ ] Latency p95 < 200ms.

**Schema:**
```typescript
interface DisplayPayload {
  date_label: string;          // "Mon Apr 27"
  top_priorities: string[];    // length ≤ 3
  routine: string[];           // length ≤ 4 (truncated labels)
  night_mode: string;          // human label e.g. "Mic night"
  next_anchor: string | null;  // e.g. "9:00 AM online" — optional
  generated_at: string;        // ISO
}
```

**Dependencies:** REQ-001, REQ-003.

---

#### REQ-007: Authentication
**Description:** Magic-link email auth (Neon Auth) for the web app; a separate device-token issuance flow for ESP32 clients.

**Acceptance Criteria:**
- [ ] Magic link sign-in works on mobile and desktop.
- [ ] Authenticated user can issue a device token from settings (one-time view of token).
- [ ] Device token is revocable.
- [ ] No password storage.

**Dependencies:** None.

---

### Should Have (P1)

#### REQ-008: ESP32 E‑Ink Client
Firmware that polls `/api/v1/display/today` every 15 minutes (configurable), renders a static layout to a Waveshare-class e‑ink panel, and deep-sleeps between polls.

**Acceptance Criteria:**
- [ ] Initial provisioning over Wi-Fi captive portal.
- [ ] Stores device token in NVS.
- [ ] Renders date + 3 priorities + ≤ 4 routine steps + night mode.
- [ ] Battery life ≥ 14 days on a 2000 mAh cell at 15-min poll.

**Dependencies:** REQ-006.

---

#### REQ-009: Not-Today Capture
Single-line "release" field on the DayPlan to externalize an intrusive task without it becoming a backlog item.

**Acceptance Criteria:**
- [ ] One field, single line.
- [ ] Cleared at next day boundary.
- [ ] Never surfaced as a task or notification.

---

### Nice to Have (P2)

#### REQ-010: AI Coaching Layer (Phase 2)
LLM-backed suggestions consuming structured DayPlan + ReflectionEntry history to generate morning priority drafts, anxiety-aware reframes, and weekly pattern insights.

**Out of MVP.** Surfaces only after ≥ 14 days of data.

---

#### REQ-011: Tomorrow Draft
At end of evening reset, capture three bullets for tomorrow that auto-populate as a *suggestion* (not autofill) on tomorrow's DayPlan.

---

## Non-Functional Requirements

### Performance
- Cold web load < 2s on 4G mid-tier mobile.
- API p95 < 200ms; display endpoint p95 < 200ms.
- ≤ 2 KB display payload.

### Security
- Magic-link auth (no passwords).
- Device tokens scoped to `display:read` only.
- TLS 1.3 everywhere.
- All user data row-level secured (Postgres RLS policies on Neon).
- Device token rotatable from settings.

### Scalability
- Designed for single-user → low-thousands of users on a single Neon free/pro instance.
- Stateless API; horizontal scale trivial later.

### Reliability
- 99% display endpoint availability target (graceful "not_planned" fallback if DB read fails would be misleading — prefer 503 with cache).
- Device firmware tolerates 24h offline (renders last-good payload from NVS).

### Accessibility
- WCAG 2.1 AA: contrast, keyboard nav, screen-reader labels on all selectors.
- All interactive targets ≥ 44×44 px.

### Compatibility
- Mobile Safari (iOS 16+), Chrome (last 2), desktop Safari/Chrome.
- ESP32-S3 with Waveshare 4.2" or 7.5" e‑ink as reference hardware.

---

## Technical Considerations

### System Architecture

```
[ Mobile Web ]──HTTPS──┐
                       ├──> [ Next.js API routes ] ──> [ Neon Postgres ]
[ ESP32 e-ink ]──HTTPS─┘                          \──> [ Auth.js + Resend ]
```

### Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (App Router) + React | Single repo for UI + API; SSR targets < 1s first paint |
| UI | Tailwind, shadcn/ui primitives | Low-decoration; ships in days, not weeks |
| State | React Server Components + light client state (Zustand) for inline edits | Avoid Redux complexity |
| DB | Neon (serverless Postgres) | Branchable Postgres, generous free tier, scales to zero |
| Auth | Auth.js (NextAuth) email provider via Resend | Magic-link UX without a bundled auth vendor |
| API | Next.js Route Handlers under `/api/v1/*` | Single deploy unit |
| Device | ESP32-S3 + Waveshare e‑ink, Arduino framework + ArduinoJson + HTTPClient | Mature library support |

### Data Model (summary)

- `users` (managed by Auth.js adapter)
- `day_plans` (REQ-001)
- `routines`, `routine_steps` (REQ-003)
- `weekly_patterns` (REQ-004)
- `reflection_entries` (REQ-005)
- `device_tokens` (REQ-007)
- (later) `coaching_insights`

### API Surface (v1)

```
POST   /api/v1/day-plans
GET    /api/v1/day-plans/today
PATCH  /api/v1/day-plans/:id
GET    /api/v1/routines?kind=morning|evening
PATCH  /api/v1/routines/:id
GET    /api/v1/weekly-pattern
PATCH  /api/v1/weekly-pattern
POST   /api/v1/reflections
GET    /api/v1/display/today          # device-token auth
POST   /api/v1/device-tokens          # user-auth, issues token
DELETE /api/v1/device-tokens/:id
```

### Migration Strategy
Greenfield. Each requirement ships a single forward migration. No rollback plan needed pre-launch beyond `supabase migration down`.

### Testing Strategy
- Unit: domain logic (timezone, payload truncation, idempotency).
- Integration: API routes hit a Neon test project.
- E2E: Playwright for the morning flow, evening flow, and send-to-display.
- Device: a mock-server harness validates payload rendering on device.

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
- Task 1.1: Neon project + auth + RLS scaffolding (4h)
- Task 1.2: `day_plans` schema + migration (3h)
- Task 1.3: `routines` + `routine_steps` schema (3h)
- Task 1.4: Next.js app skeleton + auth wiring (4h)
- **Checkpoint:** Auth works, schemas live in staging.

### Phase 2: Today Screen (Week 2)
- Task 2.1: DayPlan API (POST/GET/PATCH) (5h)
- Task 2.2: Today screen layout + header (4h)
- Task 2.3: Editable priority component (4h)
- Task 2.4: Energy + night mode selectors (3h)
- Task 2.5: Time-aware routine card (read-only) (3h)
- **USER-TEST 1:** Drive Today flow for 3 mornings.

### Phase 3: Routines + Week (Week 3)
- Task 3.1: Routines API + screen (6h)
- Task 3.2: Step editor with min-version field (4h)
- Task 3.3: Weekly pattern API + screen (5h)
- Task 3.4: Default night-mode derivation (2h)
- **USER-TEST 2:** Week tagging + routine edit usable.

### Phase 4: Reflection + Display Endpoint (Week 4)
- Task 4.1: ReflectionEntry API + Review screen (6h)
- Task 4.2: Evening routine swap logic (2h)
- Task 4.3: DisplayPayload generator (3h)
- Task 4.4: `GET /api/v1/display/today` with device-token auth + ETag (5h)
- Task 4.5: Device-token issuance UI (3h)
- **USER-TEST 3:** Evening reset + payload visible via curl.

### Phase 5: ESP32 Client (Week 5)
- Task 5.1: ESP32 firmware skeleton + Wi-Fi captive portal (6h)
- Task 5.2: Display endpoint poll + JSON parse (4h)
- Task 5.3: E‑ink rendering layout (8h)
- Task 5.4: Deep-sleep / battery optimization (4h)
- **USER-TEST 4:** Device renders today card on desk.

### Phase 6: Polish + AI Stub (Week 6)
- Task 6.1: Accessibility pass (4h)
- Task 6.2: Performance pass (target p95 < 200ms) (4h)
- Task 6.3: Coaching insights table + stub endpoint (3h)
- Task 6.4: Tomorrow-draft handoff (3h)
- **USER-TEST 5:** Two-week soak.

---

## Out of Scope (MVP)

1. AI coaching beyond a stub table — gated on ≥ 14 days of data.
2. Multi-user/team features.
3. Mobile native apps (web is the target; PWA later).
4. Calendar integration.
5. Push notifications.
6. Habit streaks / gamification.
7. Backlog or task capture beyond the single "not today" line.
8. Multiple device support per user (v1 = one device token at a time).

---

## Open Questions & Risks

### Open Questions
- **Q1:** Should the Today screen show *yesterday's* unfinished priorities? Default: no. Decide before Phase 2.
- **Q2:** Time-of-day cutoff for evening routine swap — fixed 18:00 or configurable per user? Default: configurable, default value 18:00.
- **Q3:** ESP32 reference panel size — 4.2" or 7.5"? Affects layout density. Decide before Phase 5.

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| User over-iterates on "perfect" routine and stalls | High | Medium | Seed sensible defaults; cap step count at 6 |
| Display endpoint becomes a noisy poll target | Medium | Low | ETag + 304s; default 15-min interval |
| Magic-link UX friction on mobile | Medium | Medium | Test early; allow re-send |
| Device token leak | Low | High | Scope = display:read; revocable; one token per device |
| Scope creep into "Notion-lite" | High | High | Hard rule: 5 sections max; reject any feature not in this PRD |

---

## Validation Checkpoints

- **CP1 (end Phase 1):** Auth + schemas live; no UI yet.
- **CP2 (end Phase 2):** User can plan a day in < 2 minutes; measured.
- **CP3 (end Phase 3):** Routines and week edit feel "calm" in user testing.
- **CP4 (end Phase 4):** `curl /api/v1/display/today` returns correct payload.
- **CP5 (end Phase 5):** Device renders on desk and survives 7 days unattended.
- **CP6 (end Phase 6):** 14 consecutive days of real use by primary user.

---

## Appendix: Task Breakdown Hints

**Total estimate:** ~95 hours (~6 weeks solo, evenings + weekends).

**Critical path:**
1.1 → 1.2 → 2.1 → 2.2/2.3 → 4.3 → 4.4 → 5.2 → 5.3

**Parallelizable:**
- Routines (Phase 3) can run in parallel with Week pattern.
- ESP32 firmware (Phase 5) can begin once REQ-006 ships in Phase 4.

**USER-TEST tasks** (insert after each phase): drive the flow for 3 real days; capture friction; one-line fixes only — no new features.

---

**End of PRD**
