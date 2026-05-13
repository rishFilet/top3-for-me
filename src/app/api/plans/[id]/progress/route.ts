import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import sql from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id: planId } = await params
  const { key, value } = await req.json()
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })

  const owns = await sql`
    SELECT id FROM plans WHERE id = ${planId} AND user_id = ${session.user.id} LIMIT 1
  `
  if (!owns[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await sql`
    INSERT INTO plan_progress (plan_id, user_id, key, value, updated_at)
    VALUES (${planId}, ${session.user.id}, ${key}, ${JSON.stringify(value)}::jsonb, NOW())
    ON CONFLICT (plan_id, key) DO UPDATE SET
      value = EXCLUDED.value,
      updated_at = NOW()
  `
  return NextResponse.json({ ok: true })
}
