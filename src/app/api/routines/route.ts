import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import sql from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const routines = await sql`
      SELECT * FROM routines WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
    `

    const routinesWithSteps = await Promise.all(
      routines.map(async (routine: any) => {
        const steps = await sql`
          SELECT * FROM routine_steps
          WHERE routine_id = ${routine.id}
          ORDER BY step_order ASC
        `
        return { ...routine, steps }
      })
    )

    return NextResponse.json(routinesWithSteps)
  } catch (error) {
    console.error('Error fetching routines:', error)
    return NextResponse.json({ error: 'Failed to fetch routines' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, type, steps } = body

  try {
    const routine = await sql`
      INSERT INTO routines (user_id, name, type, is_default, created_at)
      VALUES (${session.user.id}, ${name}, ${type}, false, NOW())
      RETURNING *
    `

    const routineId = routine[0].id

    if (steps && Array.isArray(steps)) {
      for (let i = 0; i < steps.length; i++) {
        await sql`
          INSERT INTO routine_steps (routine_id, step_order, label, duration_minutes, created_at)
          VALUES (${routineId}, ${i}, ${steps[i].label}, ${steps[i].durationMinutes || null}, NOW())
        `
      }
    }

    const stepsResult = await sql`
      SELECT * FROM routine_steps WHERE routine_id = ${routineId} ORDER BY step_order ASC
    `

    return NextResponse.json({ ...routine[0], steps: stepsResult }, { status: 201 })
  } catch (error) {
    console.error('Error creating routine:', error)
    return NextResponse.json({ error: 'Failed to create routine' }, { status: 500 })
  }
}
