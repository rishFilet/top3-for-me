import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import sql from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const date = new Date().toISOString().split('T')[0]

  try {
    const result = await sql`
      UPDATE day_plans
      SET sent_to_display_at = NOW(), updated_at = NOW()
      WHERE user_id = ${session.user.id} AND plan_date = ${date}
      RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error sending day plan:', error)
    return NextResponse.json({ error: 'Failed to send day plan' }, { status: 500 })
  }
}
