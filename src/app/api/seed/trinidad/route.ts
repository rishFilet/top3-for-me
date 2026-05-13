import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import sql from '@/lib/db'

const PLAN_PAYLOAD = {
  meta: {
    title: 'Trinidad Reset Plan',
    durationDays: 14,
    startDate: '2026-05-13',
    endDate: '2026-05-27',
    intention: 'Restore energy, finish meaningful things, return to Toronto grounded and confident',
  },
  dailyTop3: {
    priorities: [
      'Restore body and mind (morning ritual)',
      'Complete one meaningful work or comedy block',
      'Stay connected to family or kids',
    ],
    rituals: [
      {
        id: 'ritual_1',
        title: 'Morning Reset',
        time: 'Morning',
        steps: [
          'No Hinge or phone for first 45 minutes',
          'Pray or meditate for 10 minutes',
          'Yoga or stretch for 10 minutes',
          'Write 3 lines: how I feel, what matters today, one brave action',
        ],
      },
      {
        id: 'ritual_2',
        title: 'Focus Block',
        time: 'Midday or Afternoon',
        steps: [
          '60-90 minute focused session on one priority only',
          'No switching between tasks',
          'Check Hinge or messages once only during this window',
        ],
      },
      {
        id: 'ritual_3',
        title: 'Evening Wind Down',
        time: 'Evening',
        steps: [
          'One family or kids activity',
          'Light comedy review or creative work',
          'Phone off 45 minutes before bed',
          'Write evening reflection',
        ],
      },
    ],
    reflections: [
      'What gave me energy today?',
      'Did I act from alignment or anxiety?',
      'What did Trinidad remind me about who I am?',
      'What am I grateful for in my heritage?',
    ],
  },
  weeks: [
    {
      theme: 'Stabilize and Ground',
      top3: [
        'Stabilize sleep schedule (early to bed, early to rise)',
        'Finish one key work milestone (Validation Memo for insuretech)',
        'Refine first 5 minutes of comedy set',
      ],
      nonNegotiables: [
        '7 family or kids moments',
        '3 comedy work sessions',
        '1 work milestone completed or significantly advanced',
        '0 impulsive ex or old contact reach-outs',
        'Hinge checks capped at 2 per day',
      ],
    },
    {
      theme: 'Create and Reflect',
      top3: [
        'Post one comedy clip on Instagram',
        'Write one-year letter to future self',
        'Write 5 things I love about my Trinidadian heritage',
      ],
      nonNegotiables: [
        '7 family or kids moments',
        '3 comedy work sessions',
        'Full 10-minute set refined',
        '0 impulsive ex or old contact reach-outs',
        'Hinge checks capped at 2 per day',
      ],
    },
  ],
  mustDo: [
    'Early sleep and morning ritual daily',
    'One activity with kids daily',
    'Write one-year letter to future self',
    'List 5 things I love about my Trinidadian heritage',
    'Refine full 10-minute comedy set',
    'Complete Validation Memo for insuretech',
  ],
  shouldDo: [
    'Read 1 book (not 2)',
    'Post 1 comedy clip on Instagram',
    'Light organization of notes in Obsidian or Notion',
  ],
  deferUntilLater: [
    'Portal builds',
    'Photo scavenger app',
    'Accountability app',
    'Generator app',
    'Multiple product launches',
    'Large system setups',
    'NFC tags and printing',
    'Fern and Astrid launches',
  ],
  deliverable: {
    title: 'Validation Memo for Insuretech',
    goal: 'Complete one bounded, high-leverage professional deliverable',
    breakdown: [
      { part: 1, task: 'Define final output and scope' },
      { part: 2, task: 'Research and gather supporting data' },
      { part: 3, task: 'Draft core argument and structure' },
      { part: 4, task: 'Refine and edit' },
      { part: 5, task: 'Final review and send' },
    ],
    reflections: [
      'What is the smallest version that still counts as done?',
      'What part am I avoiding and why?',
      'What would make tomorrow\'s session easier?',
    ],
  },
  letter: {
    title: 'Letter to Future Self',
    instruction: 'Write this in week 2. Be honest about where you are now and specific about where you want to be in 12 months.',
    prompts: [
      'Where am I emotionally right now and what do I want to leave behind?',
      'What kind of relationship do I want to be in by this time next year?',
      'What does my creative life look like in 12 months?',
      'What have I built or launched that I am proud of?',
      'What kind of man do I want to be when I read this letter next year?',
    ],
  },
  heritage: {
    title: '5 Things I Love About My Trinidadian Heritage',
    instruction: 'Write one per day during week 1. Be honest and specific. Use at least one in your comedy set.',
    dayCount: 5,
  },
}

const PLAN = {
  startDate: PLAN_PAYLOAD.meta.startDate,
  priorities: [
    'Restore body and mind (morning ritual)',
    'Complete one meaningful work or comedy block',
    'Stay connected to family or kids',
  ],
  routines: [
    {
      name: 'Morning Reset',
      type: 'morning' as const,
      steps: [
        'No Hinge or phone for first 45 minutes',
        'Pray or meditate for 10 minutes',
        'Yoga or stretch for 10 minutes',
        'Write 3 lines: how I feel, what matters today, one brave action',
      ],
    },
    {
      name: 'Focus Block',
      type: 'morning' as const,
      steps: [
        '60-90 minute focused session on one priority only',
        'No switching between tasks',
        'Check Hinge or messages once only during this window',
      ],
    },
    {
      name: 'Evening Wind Down',
      type: 'evening' as const,
      steps: [
        'One family or kids activity',
        'Light comedy review or creative work',
        'Phone off 45 minutes before bed',
        'Write evening reflection',
      ],
    },
  ],
  backlog: [
    'Read 1 book (not 2)',
    'Post 1 comedy clip on Instagram',
    'Light organization of notes in Obsidian or Notion',
    '[Defer to Toronto] Portal builds',
    '[Defer to Toronto] Photo scavenger app',
    '[Defer to Toronto] Accountability app',
    '[Defer to Toronto] Generator app',
    '[Defer to Toronto] Multiple product launches',
    '[Defer to Toronto] Large system setups',
    '[Defer to Toronto] NFC tags and printing',
    '[Defer to Toronto] Fern and Astrid launches',
  ],
}

function mondayOf(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z')
  const day = d.getUTCDay()
  const diff = (day === 0 ? -6 : 1 - day)
  d.setUTCDate(d.getUTCDate() + diff)
  return d.toISOString().split('T')[0]
}

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id
  const today = PLAN.startDate
  const summary: Record<string, unknown> = {}

  await sql`
    INSERT INTO day_plans (
      user_id, plan_date, priority_1, priority_2, priority_3, created_at, updated_at
    ) VALUES (
      ${userId}, ${today}, ${PLAN.priorities[0]}, ${PLAN.priorities[1]}, ${PLAN.priorities[2]}, NOW(), NOW()
    )
    ON CONFLICT (user_id, plan_date) DO UPDATE SET
      priority_1 = EXCLUDED.priority_1,
      priority_2 = EXCLUDED.priority_2,
      priority_3 = EXCLUDED.priority_3,
      updated_at = NOW()
  `
  summary.dayPlan = today

  const createdRoutines: string[] = []
  for (const r of PLAN.routines) {
    const existing = await sql`
      SELECT id FROM routines WHERE user_id = ${userId} AND name = ${r.name} LIMIT 1
    `
    let routineId: string
    if (existing[0]) {
      routineId = existing[0].id as string
      await sql`DELETE FROM routine_steps WHERE routine_id = ${routineId}`
    } else {
      const inserted = await sql`
        INSERT INTO routines (user_id, name, type, is_default, created_at)
        VALUES (${userId}, ${r.name}, ${r.type}, false, NOW())
        RETURNING id
      `
      routineId = inserted[0].id as string
    }
    for (let i = 0; i < r.steps.length; i++) {
      await sql`
        INSERT INTO routine_steps (routine_id, step_order, label, duration_minutes, created_at)
        VALUES (${routineId}, ${i}, ${r.steps[i]}, NULL, NOW())
      `
    }
    createdRoutines.push(r.name)
  }
  summary.routines = createdRoutines

  await sql`
    CREATE TABLE IF NOT EXISTS backlog_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
  const insertedBacklog: string[] = []
  for (const text of PLAN.backlog) {
    const existing = await sql`
      SELECT id FROM backlog_items WHERE user_id = ${userId} AND text = ${text} LIMIT 1
    `
    if (existing[0]) continue
    await sql`
      INSERT INTO backlog_items (user_id, text) VALUES (${userId}, ${text})
    `
    insertedBacklog.push(text)
  }
  summary.backlogInserted = insertedBacklog.length

  await sql`
    CREATE TABLE IF NOT EXISTS weekly_metrics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      week_of DATE NOT NULL,
      meditation_7 BOOLEAN DEFAULT FALSE,
      early_bed_5 BOOLEAN DEFAULT FALSE,
      kid_moments BOOLEAN DEFAULT FALSE,
      comedy_sessions BOOLEAN DEFAULT FALSE,
      work_milestone BOOLEAN DEFAULT FALSE,
      ex_reachouts BOOLEAN DEFAULT FALSE,
      hinge_checks BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(user_id, week_of)
    )
  `
  const week1 = mondayOf(PLAN.startDate)
  const week2Date = new Date(week1 + 'T00:00:00Z')
  week2Date.setUTCDate(week2Date.getUTCDate() + 7)
  const week2 = week2Date.toISOString().split('T')[0]
  for (const w of [week1, week2]) {
    await sql`
      INSERT INTO weekly_metrics (user_id, week_of)
      VALUES (${userId}, ${w})
      ON CONFLICT (user_id, week_of) DO NOTHING
    `
  }
  summary.weeklyMetricsSeeded = [week1, week2]

  await sql`
    CREATE TABLE IF NOT EXISTS plans (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      intention TEXT,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
  const existingPlan = await sql`
    SELECT id FROM plans
    WHERE user_id = ${userId} AND title = ${PLAN_PAYLOAD.meta.title}
    LIMIT 1
  `
  if (existingPlan[0]) {
    await sql`
      UPDATE plans SET
        start_date = ${PLAN_PAYLOAD.meta.startDate},
        end_date = ${PLAN_PAYLOAD.meta.endDate},
        intention = ${PLAN_PAYLOAD.meta.intention},
        payload = ${JSON.stringify(PLAN_PAYLOAD)}::jsonb,
        updated_at = NOW()
      WHERE id = ${existingPlan[0].id}
    `
    summary.plan = { id: existingPlan[0].id, action: 'updated' }
  } else {
    const newPlan = await sql`
      INSERT INTO plans (user_id, title, start_date, end_date, intention, payload)
      VALUES (
        ${userId},
        ${PLAN_PAYLOAD.meta.title},
        ${PLAN_PAYLOAD.meta.startDate},
        ${PLAN_PAYLOAD.meta.endDate},
        ${PLAN_PAYLOAD.meta.intention},
        ${JSON.stringify(PLAN_PAYLOAD)}::jsonb
      )
      RETURNING id
    `
    summary.plan = { id: newPlan[0].id, action: 'created' }
  }

  return NextResponse.json({ ok: true, summary })
}
