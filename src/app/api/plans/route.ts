import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import sql from '@/lib/db'
import { Plan } from '@/lib/types'

async function ensureTables() {
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
  await sql`
    CREATE TABLE IF NOT EXISTS plan_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(plan_id, key)
    )
  `
}

function normalize(row: Record<string, unknown>): Plan {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    intention: (row.intention as string) ?? '',
    payload: row.payload as Plan['payload'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await ensureTables()
  const rows = await sql`
    SELECT * FROM plans
    WHERE user_id = ${session.user.id}
    ORDER BY start_date DESC
  `
  return NextResponse.json(rows.map(normalize))
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await ensureTables()
  const body = await req.json()
  const { title, startDate, endDate, intention, payload } = body
  if (!title || !startDate || !endDate || !payload) {
    return NextResponse.json({ error: 'title, startDate, endDate, payload required' }, { status: 400 })
  }
  const result = await sql`
    INSERT INTO plans (user_id, title, start_date, end_date, intention, payload)
    VALUES (${session.user.id}, ${title}, ${startDate}, ${endDate}, ${intention ?? ''}, ${payload}::jsonb)
    RETURNING *
  `
  return NextResponse.json(normalize(result[0]))
}
