import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import sql from '@/lib/db'
import { ensureTables } from '@/app/api/plans/route'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await ensureTables()

  const planRows = await sql`
    SELECT * FROM plans
    WHERE user_id = ${session.user.id}
      AND CURRENT_DATE BETWEEN start_date AND end_date
    ORDER BY start_date DESC
    LIMIT 1
  `
  if (!planRows[0]) {
    return NextResponse.json({ plan: null, progress: [] })
  }
  const plan = planRows[0]
  const progress = await sql`
    SELECT key, value, updated_at AS "updatedAt"
    FROM plan_progress
    WHERE plan_id = ${plan.id}
  `
  return NextResponse.json({
    plan: {
      id: plan.id,
      userId: plan.user_id,
      title: plan.title,
      startDate: plan.start_date,
      endDate: plan.end_date,
      intention: plan.intention ?? '',
      payload: plan.payload,
      createdAt: plan.created_at,
      updatedAt: plan.updated_at,
    },
    progress,
  })
}
