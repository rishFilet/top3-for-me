'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { DayPlan, Routine, BacklogItem } from '@/lib/types'
import { AppShell } from '@/components/app-shell'
import { PriorityCard } from '@/components/priority-card'
import { BacklogChecklist } from '@/components/backlog-checklist'
import { RoutineCard } from '@/components/routine-card'
import { SendButton } from '@/components/send-button'

export default function HomePage() {
  const router = useRouter()
  const [dayPlan, setDayPlan] = useState<DayPlan | null>(null)
  const [routine, setRoutine] = useState<Routine | null>(null)
  const [routineExpanded, setRoutineExpanded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [backlog, setBacklog] = useState<BacklogItem[]>([])
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const today = useMemo(() => new Date(), [])
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  const userInitial = 'R'

  const fetchDayPlan = useCallback(async () => {
    try {
      const res = await fetch('/api/day-plans')
      if (res.status === 401) {
        router.push('/login')
        return
      }
      const data = await res.json()
      setDayPlan(data)

      const hour = today.getHours()
      const isMorning = hour < 18
      const routineId = isMorning ? data?.morning_routine_id : data?.evening_routine_id

      if (routineId) {
        const routinesRes = await fetch('/api/routines')
        const routines = await routinesRes.json()
        const selectedRoutine = routines.find((r: Routine) => r.id === routineId)
        setRoutine(selectedRoutine || null)
      }

      const backlogRes = await fetch('/api/backlog')
      if (backlogRes.ok) setBacklog(await backlogRes.json())
    } catch (error) {
      console.error('Error fetching day plan:', error)
    } finally {
      setLoading(false)
    }
  }, [router, today])

  useEffect(() => {
    fetchDayPlan()
  }, [fetchDayPlan])

  const handleFieldChange = useCallback(
    (field: keyof DayPlan, value: any) => {
      const updated = { ...dayPlan, [field]: value }
      setDayPlan(updated as DayPlan)

      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => {
        saveChanges(updated as DayPlan)
      }, 800)
    },
    [dayPlan]
  )

  const saveChanges = async (plan: DayPlan) => {
    try {
      await fetch('/api/day-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planDate: plan.planDate,
          priority1: plan.priority1,
          priority2: plan.priority2,
          priority3: plan.priority3,
        }),
      })
    } catch (error) {
      console.error('Error saving changes:', error)
    }
  }

  const handleBacklogAdd = async (text: string) => {
    const res = await fetch('/api/backlog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (res.ok) {
      const item = await res.json()
      setBacklog((prev) => [...prev, item])
    }
  }

  const handleBacklogDelete = async (id: string) => {
    await fetch('/api/backlog', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setBacklog((prev) => prev.filter((i) => i.id !== id))
  }

  const handleSend = async () => {
    try {
      await fetch('/api/day-plans/send', { method: 'POST' })
      await fetchDayPlan()
    } catch (error) {
      console.error('Error sending plan:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <AppShell userInitial={userInitial}>
      <div className="p-6 md:p-10 max-w-4xl">
        {/* Date + hero */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 pb-8 border-b-2 border-stone-200">
          <div className="flex-1">
            <span className="text-xs text-stone-400 uppercase tracking-widest">
              {dayName}, {dateStr}
            </span>
            <h1 className="font-['Newsreader'] text-4xl md:text-5xl text-stone-800 mt-2 mb-3">
              Settle in. Let's focus.
            </h1>
            <p className="text-stone-500 text-base">
              The mind is clearest in the morning. Identify your core anchors for the day
              before the noise begins.
            </p>
          </div>
        </div>

        {/* Top 3 Priorities */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-[#E29578]">push_pin</span>
            <h2 className="font-['Newsreader'] text-2xl text-stone-800">Top 3 Priorities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PriorityCard
              number={1}
              label="Priority 1"
              value={dayPlan?.priority1 || null}
              onChange={(v) => handleFieldChange('priority1', v)}
              placeholder="Your top priority..."
              icon="draw"
            />
            <PriorityCard
              number={2}
              label="Priority 2"
              value={dayPlan?.priority2 || null}
              onChange={(v) => handleFieldChange('priority2', v)}
              placeholder="Second priority..."
              icon="forum"
            />
            <PriorityCard
              number={3}
              label="Priority 3"
              value={dayPlan?.priority3 || null}
              onChange={(v) => handleFieldChange('priority3', v)}
              placeholder="Third priority..."
              icon="self_improvement"
            />
          </div>
        </section>

        {/* Bonus or Defer */}
        <BacklogChecklist
          items={backlog}
          onAdd={handleBacklogAdd}
          onDelete={handleBacklogDelete}
        />

        {/* Routine Card */}
        <section className="mb-10">
          <RoutineCard
            routine={routine}
            isExpanded={routineExpanded}
            onToggle={() => setRoutineExpanded(!routineExpanded)}
          />
        </section>

        {/* Send */}
        <SendButton onSend={handleSend} sentAt={dayPlan?.sentToDisplayAt || null} />
      </div>
    </AppShell>
  )
}
