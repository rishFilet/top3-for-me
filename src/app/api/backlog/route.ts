import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import sql from '@/lib/db'

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS backlog_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 401 })

  await ensureTable()
  const rows = await sql`
    SELECT id, user_id AS "userId", text, created_at AS "createdAt"
    FROM backlog_items
    WHERE user_id = ${session.user.id}
    ORDER BY created_at ASC
  `
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 })

  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'text required' }, { status: 400 })

  await ensureTable()
  const [row] = await sql`
    INSERT INTO backlog_items (user_id, text)
    VALUES (${session.user.id}, ${text.trim()})
    RETURNING id, user_id AS "userId", text, created_at AS "createdAt"
  `
  return NextResponse.json(row)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 })

  const { id } = await req.json()
  await sql`
    DELETE FROM backlog_items
    WHERE id = ${id} AND user_id = ${session.user.id}
  `
  return NextResponse.json({ ok: true })
}
