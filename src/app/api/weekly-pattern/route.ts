import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import sql from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const patterns = await sql`
      SELECT * FROM weekly_patterns
      WHERE user_id = ${session.user.id}
      ORDER BY day_of_week ASC
    `
    return NextResponse.json(patterns)
  } catch (error) {
    console.error('Error fetching weekly patterns:', error)
    return NextResponse.json({ error: 'Failed to fetch weekly patterns' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { dayOfWeek, defaultNightMode, morningRoutineId, eveningRoutineId } = body

  try {
    const result = await sql`
      INSERT INTO weekly_patterns (
        user_id, day_of_week, default_night_mode,
        morning_routine_id, evening_routine_id
      ) VALUES (
        ${session.user.id}, ${dayOfWeek}, ${defaultNightMode || null},
        ${morningRoutineId || null}, ${eveningRoutineId || null}
      )
      ON CONFLICT (user_id, day_of_week) DO UPDATE SET
        default_night_mode = EXCLUDED.default_night_mode,
        morning_routine_id = EXCLUDED.morning_routine_id,
        evening_routine_id = EXCLUDED.evening_routine_id
      RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error upserting weekly pattern:', error)
    return NextResponse.json({ error: 'Failed to upsert weekly pattern' }, { status: 500 })
  }
}
