import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import sql from '@/lib/db'
import { DayPlan } from '@/lib/types'

// Neon returns snake_case; normalize to match the DayPlan type
function normalize(row: Record<string, unknown>): DayPlan {
  return {
    ...row,
    priority1: row.priority_1 as string | null,
    priority2: row.priority_2 as string | null,
    priority3: row.priority_3 as string | null,
  } as DayPlan
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dateParam = req.nextUrl.searchParams.get('date')
  const date = dateParam || new Date().toISOString().split('T')[0]

  try {
    const result = await sql`
      SELECT * FROM day_plans
      WHERE user_id = ${session.user.id} AND plan_date = ${date}
    `
    const plan = result[0] ? normalize(result[0]) : null
    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error fetching day plan:', error)
    return NextResponse.json({ error: 'Failed to fetch day plan' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const {
    planDate,
    priority1,
    priority2,
    priority3,
    notToday,
    energyLevel,
    nightMode,
  } = body

  const date = planDate || new Date().toISOString().split('T')[0]

  try {
    const result = await sql`
      INSERT INTO day_plans (
        user_id, plan_date, priority_1, priority_2, priority_3,
        not_today, energy_level, night_mode, created_at, updated_at
      ) VALUES (
        ${session.user.id}, ${date}, ${priority1 || null}, ${priority2 || null},
        ${priority3 || null}, ${notToday || null}, ${energyLevel || null},
        ${nightMode || null}, NOW(), NOW()
      )
      ON CONFLICT (user_id, plan_date) DO UPDATE SET
        priority_1 = EXCLUDED.priority_1,
        priority_2 = EXCLUDED.priority_2,
        priority_3 = EXCLUDED.priority_3,
        not_today = EXCLUDED.not_today,
        energy_level = EXCLUDED.energy_level,
        night_mode = EXCLUDED.night_mode,
        updated_at = NOW()
      RETURNING *
    `
    return NextResponse.json(normalize(result[0]))
  } catch (error) {
    console.error('Error upserting day plan:', error)
    return NextResponse.json({ error: 'Failed to upsert day plan' }, { status: 500 })
  }
}
