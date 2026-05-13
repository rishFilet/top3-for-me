import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import sql from '@/lib/db'
import { WeeklyMetrics } from '@/lib/types'

// Normalize snake_case from Neon to camelCase
function normalize(row: Record<string, unknown>): WeeklyMetrics {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    weekOf: row.week_of as string,
    meditation7: row.meditation_7 as boolean,
    earlyBed5: row.early_bed_5 as boolean,
    kidMoments: row.kid_moments as boolean,
    comedySessions: row.comedy_sessions as boolean,
    workMilestone: row.work_milestone as boolean,
    exReachouts: row.ex_reachouts as boolean,
    hingeChecks: row.hinge_checks as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

async function ensureTable() {
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
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const weekOfParam = req.nextUrl.searchParams.get('weekOf')
  if (!weekOfParam) {
    return NextResponse.json({ error: 'weekOf query parameter required' }, { status: 400 })
  }

  try {
    await ensureTable()
    const result = await sql`
      SELECT *
      FROM weekly_metrics
      WHERE user_id = ${session.user.id} AND week_of = ${weekOfParam}
    `
    const metrics = result[0] ? normalize(result[0]) : null
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching weekly metrics:', error)
    return NextResponse.json({ error: 'Failed to fetch weekly metrics' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const {
    weekOf,
    meditation7,
    earlyBed5,
    kidMoments,
    comedySessions,
    workMilestone,
    exReachouts,
    hingeChecks,
  } = body

  if (!weekOf) {
    return NextResponse.json({ error: 'weekOf required' }, { status: 400 })
  }

  try {
    await ensureTable()
    const result = await sql`
      INSERT INTO weekly_metrics (
        user_id, week_of, meditation_7, early_bed_5, kid_moments,
        comedy_sessions, work_milestone, ex_reachouts, hinge_checks,
        created_at, updated_at
      ) VALUES (
        ${session.user.id}, ${weekOf}, ${meditation7 || false}, ${earlyBed5 || false},
        ${kidMoments || false}, ${comedySessions || false}, ${workMilestone || false},
        ${exReachouts || false}, ${hingeChecks || false}, NOW(), NOW()
      )
      ON CONFLICT (user_id, week_of) DO UPDATE SET
        meditation_7 = COALESCE(EXCLUDED.meditation_7, weekly_metrics.meditation_7),
        early_bed_5 = COALESCE(EXCLUDED.early_bed_5, weekly_metrics.early_bed_5),
        kid_moments = COALESCE(EXCLUDED.kid_moments, weekly_metrics.kid_moments),
        comedy_sessions = COALESCE(EXCLUDED.comedy_sessions, weekly_metrics.comedy_sessions),
        work_milestone = COALESCE(EXCLUDED.work_milestone, weekly_metrics.work_milestone),
        ex_reachouts = COALESCE(EXCLUDED.ex_reachouts, weekly_metrics.ex_reachouts),
        hinge_checks = COALESCE(EXCLUDED.hinge_checks, weekly_metrics.hinge_checks),
        updated_at = NOW()
      RETURNING *
    `
    return NextResponse.json(normalize(result[0]))
  } catch (error) {
    console.error('Error upserting weekly metrics:', error)
    return NextResponse.json({ error: 'Failed to upsert weekly metrics' }, { status: 500 })
  }
}
