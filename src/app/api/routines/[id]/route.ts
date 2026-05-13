import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import sql from '@/lib/db'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, type, isDefault, steps } = body
  const { id: routineId } = await params

  try {
    // Verify ownership
    const routine = await sql`
      SELECT * FROM routines WHERE id = ${routineId} AND user_id = ${session.user.id}
    `
    if (routine.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Update routine
    await sql`
      UPDATE routines
      SET name = ${name}, type = ${type}, is_default = ${isDefault || false}
      WHERE id = ${routineId}
    `

    // Delete existing steps
    await sql`DELETE FROM routine_steps WHERE routine_id = ${routineId}`

    // Insert new steps
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

    const updatedRoutine = await sql`
      SELECT * FROM routines WHERE id = ${routineId}
    `

    return NextResponse.json({ ...updatedRoutine[0], steps: stepsResult })
  } catch (error) {
    console.error('Error updating routine:', error)
    return NextResponse.json({ error: 'Failed to update routine' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: routineId } = await params

  try {
    // Verify ownership
    const routine = await sql`
      SELECT * FROM routines WHERE id = ${routineId} AND user_id = ${session.user.id}
    `
    if (routine.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Delete steps
    await sql`DELETE FROM routine_steps WHERE routine_id = ${routineId}`

    // Delete routine
    await sql`DELETE FROM routines WHERE id = ${routineId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting routine:', error)
    return NextResponse.json({ error: 'Failed to delete routine' }, { status: 500 })
  }
}
