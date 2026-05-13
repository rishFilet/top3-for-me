# Plan: Add Weekly Metrics Dashboard + Guided Reflection Prompts

## Approach
Add persistent weekly tracking (meditation 7/7, early bed 5/7, kid moments, comedy sessions, work milestones, ex reach-outs, Hinge checks) with a new /weekly dashboard, and enrich the Reflect page with structured evening/night writing prompts (did well, gratitude, heritage insight).

## Scope

**In:**
- Weekly metrics schema (weekly_metrics table, auto-create on first hit)
- New WeeklyMetrics type for TypeScript
- New /api/weekly-metrics route (GET/POST by userId + weekOf date)
- New /weekly page showing 7/7 checklist view + progress indicators
- Extend Reflect page with 3 guided prompts (evening ritual) instead of just "highlight"
- Nav bar link to Weekly page (optional toggle to show/hide)
- Keep daily priority1/2/3 + backlog unchanged

**Out:**
- No ritual reminders or push notifications
- No editing past weeks' metrics
- No weekly goals/targets persistence (just tracking)

## Action Items

- [ ] **Discover:** Confirm Neon schema — check if weekly_metrics table exists
- [ ] **Schema:** Add weekly_metrics table (auto-create via ensureTable pattern): user_id, week_of (date), meditation_7, early_bed_5, kid_moments, comedy_sessions, work_milestone, ex_reachouts, hinge_checks (all booleans, defaults false)
- [ ] **Types:** Add WeeklyMetrics interface to src/lib/types.ts
- [ ] **API:** Implement GET /api/weekly-metrics?weekOf=YYYY-MM-DD (fetch) and POST (upsert) for weekOf date
- [ ] **Component:** Create src/components/weekly-metrics-checklist.tsx (7 toggleable items with labels + visual completion %)
- [ ] **Page:** Create src/app/weekly/page.tsx (header "This Week's Metrics", fetch weekOf current Sunday, render checklist)
- [ ] **Reflect Extend:** Replace "What was the highlight?" with 3-prompt flow: (1) one thing I did well, (2) one thing I'm grateful for, (3) one thing I love about my heritage — map to reflectionNote as multiline
- [ ] **Nav:** Add "Weekly" link to nav bar (optional, can be added later if UI crowding)
- [ ] **Test:** Verify types compile, test weekly metrics fetch/save flow in browser
- [ ] **Commit:** Create PR with all changes

## Open Questions

1. Should weekly metrics checkboxes auto-sync on toggle, or require a save button like Reflect?
2. Should the weekly page show past weeks too (with prev/next nav), or just current week?
3. For the 3 reflect prompts, should they replace the "highlight" question entirely, or add to it?
