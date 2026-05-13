import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import sql from '@/lib/db'
import { randomBytes } from 'crypto'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const tokens = await sql`
      SELECT * FROM device_tokens
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
    `
    return NextResponse.json(tokens)
  } catch (error) {
    console.error('Error fetching device tokens:', error)
    return NextResponse.json({ error: 'Failed to fetch device tokens' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { label } = body
  const token = randomBytes(32).toString('hex')

  try {
    const result = await sql`
      INSERT INTO device_tokens (user_id, token, label, created_at)
      VALUES (${session.user.id}, ${token}, ${label || null}, NOW())
      RETURNING *
    `
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Error creating device token:', error)
    return NextResponse.json({ error: 'Failed to create device token' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
  }

  try {
    // Verify ownership
    const token = await sql`
      SELECT * FROM device_tokens WHERE id = ${id} AND user_id = ${session.user.id}
    `
    if (token.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await sql`DELETE FROM device_tokens WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting device token:', error)
    return NextResponse.json({ error: 'Failed to delete device token' }, { status: 500 })
  }
}
