import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

interface DisplayPayload {
  date: string
  priorities: (string | null)[]
  notToday: string | null
  nightMode: string | null
  routine: { name: string; steps: any[] } | null
  sentAt: string | null
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing or invalid token' }, { status: 401 })
  }

  const token = authHeader.slice(7)

  try {
    // Get user from device token
    const deviceToken = await sql`
      SELECT * FROM device_tokens WHERE token = ${token}
    `
    if (deviceToken.length === 0) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = deviceToken[0].user_id

    // Update last polled time
    await sql`
      UPDATE device_tokens SET last_polled_at = NOW() WHERE token = ${token}
    `

    // Get today's day plan
    const today = new Date().toISOString().split('T')[0]
    const dayPlans = await sql`
      SELECT * FROM day_plans WHERE user_id = ${userId} AND plan_date = ${today}
    `
    const dayPlan = dayPlans[0]

    // Determine time of day (morning before 18:00, evening after)
    const hour = new Date().getHours()
    const isMorning = hour < 18

    let routine = null
    if (dayPlan) {
      const routineId = isMorning
        ? dayPlan.morning_routine_id
        : dayPlan.evening_routine_id

      if (routineId) {
        const routines = await sql`
          SELECT * FROM routines WHERE id = ${routineId}
        `
        if (routines.length > 0) {
          const routineData = routines[0]
          const steps = await sql`
            SELECT * FROM routine_steps WHERE routine_id = ${routineId}
            ORDER BY step_order ASC
          `
          routine = { name: routineData.name, steps }
        }
      }
    }

    const dateObj = new Date(today)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const dateStr = `${dayNames[dateObj.getUTCDay()]} ${monthNames[dateObj.getUTCMonth()]} ${dateObj.getUTCDate()}`

    const payload: DisplayPayload = {
      date: dateStr,
      priorities: dayPlan
        ? [dayPlan.priority_1, dayPlan.priority_2, dayPlan.priority_3]
        : [null, null, null],
      notToday: dayPlan?.not_today || null,
      nightMode: dayPlan?.night_mode || null,
      routine,
      sentAt: dayPlan?.sent_to_display_at || null,
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Error fetching display data:', error)
    return NextResponse.json({ error: 'Failed to fetch display data' }, { status: 500 })
  }
}
