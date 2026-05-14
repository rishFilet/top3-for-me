'use client'

import { useEffect, useState } from 'react'
import type { Plan, PlanProgressEntry } from '@/lib/types'

type ProgressMap = Record<string, unknown>

function progressToMap(rows: PlanProgressEntry[]): ProgressMap {
  const m: ProgressMap = {}
  for (const r of rows) m[r.key] = r.value
  return m
}

function toDatePart(iso: string): string {
  return iso.slice(0, 10)
}

function daysBetween(startISO: string, endISO: string): number {
  const a = new Date(toDatePart(startISO) + 'T00:00:00Z').getTime()
  const b = new Date(toDatePart(endISO) + 'T00:00:00Z').getTime()
  return Math.round((b - a) / (1000 * 60 * 60 * 24)) + 1
}

function dayNumberToday(startISO: string): number {
  const start = new Date(toDatePart(startISO) + 'T00:00:00Z').getTime()
  const now = new Date()
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).getTime()
  return Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1
}

function formatDate(iso: string): string {
  return new Date(toDatePart(iso) + 'T00:00:00Z').toLocaleDateString('en-CA', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
}

export default function PlanPage() {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [progress, setProgress] = useState<ProgressMap>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/plans/active')
      .then((r) => r.json())
      .then((data) => {
        setPlan(data.plan)
        setProgress(progressToMap(data.progress ?? []))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function updateProgress(key: string, value: unknown) {
    if (!plan) return
    setProgress((p) => ({ ...p, [key]: value }))
    await fetch(`/api/plans/${plan.id}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
  }

  if (loading) return <main className="p-6">Loading…</main>

  if (!plan) {
    return (
      <main className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">No active plan</h1>
        <p className="text-sm text-gray-600">
          POST to <code>/api/seed/trinidad</code> to create one, or build a new
          plan via <code>POST /api/plans</code>.
        </p>
      </main>
    )
  }

  const totalDays = daysBetween(plan.startDate, plan.endDate)
  const dayN = Math.max(1, Math.min(totalDays, dayNumberToday(plan.startDate)))
  const currentWeekIdx = dayN <= 7 ? 0 : 1
  const p = plan.payload
  const week = p.weeks[currentWeekIdx]

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">{p.meta.title}</h1>
        <p className="text-sm text-gray-600 mt-1">{p.meta.intention}</p>
        <p className="text-xs text-gray-500 mt-2">
          Day {dayN} of {totalDays} &middot; {formatDate(plan.startDate)} → {formatDate(plan.endDate)}
        </p>
      </header>

      <section>
        <h2 className="font-medium mb-2">Week {currentWeekIdx + 1}: {week.theme}</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          {week.top3.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
        <h3 className="text-xs uppercase text-gray-500 mt-3 mb-1">Non-negotiables</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          {week.nonNegotiables.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </section>

      <section>
        <h2 className="font-medium mb-2">Daily rituals</h2>
        <div className="space-y-3">
          {p.dailyTop3.rituals.map((r) => (
            <div key={r.id} className="border rounded p-3">
              <div className="flex items-baseline justify-between">
                <h3 className="font-medium">{r.title}</h3>
                <span className="text-xs text-gray-500">{r.time}</span>
              </div>
              <ul className="mt-2 space-y-1 text-sm">
                {r.steps.map((s, i) => {
                  const key = `ritual.${r.id}.${i}`
                  const done = Boolean(progress[key])
                  return (
                    <li key={i}>
                      <label className="flex gap-2 items-start cursor-pointer">
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={(e) => updateProgress(key, e.target.checked)}
                          className="mt-1"
                        />
                        <span className={done ? 'line-through text-gray-400' : ''}>{s}</span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-medium mb-2">{p.deliverable.title}</h2>
        <p className="text-sm text-gray-600 mb-2">{p.deliverable.goal}</p>
        <ul className="space-y-1 text-sm">
          {p.deliverable.breakdown.map((b) => {
            const key = `deliverable.part.${b.part}`
            const done = Boolean(progress[key])
            return (
              <li key={b.part}>
                <label className="flex gap-2 items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={(e) => updateProgress(key, e.target.checked)}
                    className="mt-1"
                  />
                  <span className={done ? 'line-through text-gray-400' : ''}>
                    Part {b.part}: {b.task}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      </section>

      <section>
        <h2 className="font-medium mb-2">{p.heritage.title}</h2>
        <p className="text-xs text-gray-600 mb-2">{p.heritage.instruction}</p>
        <div className="space-y-2">
          {Array.from({ length: p.heritage.dayCount }, (_, i) => {
            const key = `heritage.${i + 1}`
            const value = (progress[key] as string) ?? ''
            return (
              <div key={i}>
                <label className="text-xs text-gray-500">Day {i + 1}</label>
                <textarea
                  className="w-full border rounded p-2 text-sm"
                  rows={2}
                  defaultValue={value}
                  onBlur={(e) => {
                    if (e.target.value !== value) updateProgress(key, e.target.value)
                  }}
                />
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="font-medium mb-2">{p.letter.title}</h2>
        <p className="text-xs text-gray-600 mb-2">{p.letter.instruction}</p>
        <div className="space-y-3">
          {p.letter.prompts.map((prompt, i) => {
            const key = `letter.${i}`
            const value = (progress[key] as string) ?? ''
            return (
              <div key={i}>
                <label className="text-xs text-gray-700 block mb-1">{prompt}</label>
                <textarea
                  className="w-full border rounded p-2 text-sm"
                  rows={3}
                  defaultValue={value}
                  onBlur={(e) => {
                    if (e.target.value !== value) updateProgress(key, e.target.value)
                  }}
                />
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="font-medium mb-2">Must-do this fortnight</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          {p.mustDo.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </section>
    </main>
  )
}
