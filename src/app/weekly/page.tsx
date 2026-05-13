'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Routine, WeeklyPattern } from '@/lib/types'
import { AppShell } from '@/components/app-shell'
import { WeeklyMetricsChecklist } from '@/components/weekly-metrics-checklist'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const NIGHT_MODES = ['mic', 'light', 'rest', 'open']

interface WeeklyMetrics {
  meditation?: boolean
  early_bed?: boolean
  kid_moments?: boolean
  comedy_sessions?: boolean
  work_milestone?: boolean
  ex_reachouts?: boolean
  hinge_checks?: boolean
}

export default function WeeklyPage() {
  const router = useRouter()
  const [patterns, setPatterns] = useState<WeeklyPattern[]>([])
  const [routines, setRoutines] = useState<Routine[]>([])
  const [metrics, setMetrics] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [debounceTimers, setDebounceTimers] = useState<Record<number, NodeJS.Timeout>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pRes = await fetch('/api/weekly-pattern')
        if (pRes.status === 401) {
          router.push('/login')
          return
        }
        const pData = await pRes.json()
        setPatterns(pData)

        const rRes = await fetch('/api/routines')
        const rData = await rRes.json()
        setRoutines(rData)

        const mRes = await fetch('/api/weekly-metrics')
        if (mRes.ok) {
          const mData: WeeklyMetrics = await mRes.json()
          const checks: Record<string, boolean> = {
            meditation: mData.meditation || false,
            early_bed: mData.early_bed || false,
            kid_moments: mData.kid_moments || false,
            comedy_sessions: mData.comedy_sessions || false,
            work_milestone: mData.work_milestone || false,
            ex_reachouts: mData.ex_reachouts || false,
            hinge_checks: mData.hinge_checks || false,
          }
          setMetrics(checks)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [router])

  const savePattern = useCallback(
    (dayOfWeek: number, updates: Partial<WeeklyPattern>) => {
      if (debounceTimers[dayOfWeek]) {
        clearTimeout(debounceTimers[dayOfWeek])
      }

      const timer = setTimeout(() => {
        const existing = patterns.find((p) => p.dayOfWeek === dayOfWeek)
        const payload = {
          dayOfWeek,
          defaultNightMode: updates.defaultNightMode ?? existing?.defaultNightMode,
          morningRoutineId: updates.morningRoutineId ?? existing?.morningRoutineId,
          eveningRoutineId: updates.eveningRoutineId ?? existing?.eveningRoutineId,
        }

        fetch('/api/weekly-pattern', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
          .then((res) => res.json())
          .then((data) => {
            setPatterns((prev) => {
              const idx = prev.findIndex((p) => p.dayOfWeek === dayOfWeek)
              if (idx >= 0) {
                const updated = [...prev]
                updated[idx] = data
                return updated
              }
              return [...prev, data]
            })
          })
          .catch((error) => console.error('Error saving pattern:', error))
      }, 800)

      setDebounceTimers({ ...debounceTimers, [dayOfWeek]: timer })
    },
    [patterns, debounceTimers]
  )

  const handleMetricToggle = async (id: string, checked: boolean) => {
    try {
      const response = await fetch('/api/weekly-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [id]: checked,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update metric: ${response.statusText}`)
      }
    } catch (error) {
      console.error(`Error updating metric ${id}:`, error)
      throw error
    }
  }

  const today = new Date()
  const currentDayOfWeek = today.getDay()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <AppShell userInitial="R">
      <div className="p-6 md:p-10 max-w-6xl">
        {/* Metrics Section */}
        <div className="mb-12">
          <div className="mb-6">
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-2">Weekly Ritual</p>
            <h2 className="font-['Newsreader'] text-4xl text-stone-800 mb-3">This Week's Metrics</h2>
            <p className="text-stone-600 text-base">Track the practices and moments that matter to you.</p>
          </div>
          <WeeklyMetricsChecklist initialChecks={metrics} onToggle={handleMetricToggle} />
        </div>

        {/* Divider */}
        <div className="border-t-2 border-stone-200 my-12" />

        {/* Weekly Pattern Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-['Newsreader'] text-4xl text-stone-800 mb-2">
              Weekly Overview
            </h1>
            <p className="text-stone-500 text-sm">
              {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {DAY_NAMES.map((day, idx) => {
            const isToday = currentDayOfWeek === idx
            const pattern = patterns.find((p) => p.dayOfWeek === idx) || {
              dayOfWeek: idx,
              defaultNightMode: null,
              morningRoutineId: null,
              eveningRoutineId: null,
            }
            return (
              <article
                key={idx}
                className={`rounded-xl p-5 border-2 flex flex-col min-h-[220px] transition-all
                  ${
                    isToday
                      ? 'bg-[#fdf9ee] border-[#E29578] shadow-[4px_4px_0px_0px_rgba(226,149,120,1)] -translate-y-1 -translate-x-1 relative'
                      : 'bg-[#F4EBD0] border-stone-600 shadow-[4px_4px_0px_0px_rgba(229,217,182,1)] hover:-translate-y-0.5 hover:-translate-x-0.5'
                  }`}
              >
                {isToday && (
                  <div className="absolute -top-3 -right-3 bg-[#E29578] text-white px-3 py-1 rounded-full text-xs font-bold border-2 border-stone-800">
                    Today
                  </div>
                )}
                <div className="flex justify-between items-start mb-4 border-b-2 border-stone-200 pb-3">
                  <div>
                    <h3 className="font-['Newsreader'] text-lg font-semibold text-stone-800">
                      {day}
                    </h3>
                  </div>
                </div>

                {/* Night mode select */}
                <div className="mb-3">
                  <label className="text-xs text-stone-400 mb-1 block">Night Mode</label>
                  <select
                    className="w-full p-2 bg-[#fdf9ee] border border-stone-300 rounded-lg text-sm text-stone-700"
                    value={pattern.defaultNightMode || ''}
                    onChange={(e) =>
                      savePattern(idx, {
                        defaultNightMode: (e.target.value as any) || null,
                      })
                    }
                  >
                    <option value="">None</option>
                    {NIGHT_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Morning routine select */}
                <div className="mb-3">
                  <label className="text-xs text-stone-400 mb-1 block">Morning</label>
                  <select
                    className="w-full p-2 bg-[#fdf9ee] border border-stone-300 rounded-lg text-sm text-stone-700"
                    value={pattern.morningRoutineId || ''}
                    onChange={(e) =>
                      savePattern(idx, {
                        morningRoutineId: e.target.value || null,
                      })
                    }
                  >
                    <option value="">None</option>
                    {routines
                      .filter((r) => r.type === 'morning')
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Evening routine select */}
                <div>
                  <label className="text-xs text-stone-400 mb-1 block">Evening</label>
                  <select
                    className="w-full p-2 bg-[#fdf9ee] border border-stone-300 rounded-lg text-sm text-stone-700"
                    value={pattern.eveningRoutineId || ''}
                    onChange={(e) =>
                      savePattern(idx, {
                        eveningRoutineId: e.target.value || null,
                      })
                    }
                  >
                    <option value="">None</option>
                    {routines
                      .filter((r) => r.type === 'evening')
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                  </select>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
