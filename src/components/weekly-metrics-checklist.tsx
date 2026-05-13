'use client'

import { useState, useCallback } from 'react'

interface MetricItem {
  id: string
  label: string
  targetWeek: number
}

const METRICS: MetricItem[] = [
  { id: 'meditation', label: 'Meditation', targetWeek: 7 },
  { id: 'early_bed', label: 'Early to bed', targetWeek: 7 },
  { id: 'kid_moments', label: 'Kid moments', targetWeek: 7 },
  { id: 'comedy_sessions', label: 'Comedy sessions', targetWeek: 7 },
  { id: 'work_milestone', label: 'Work milestone', targetWeek: 7 },
  { id: 'ex_reachouts', label: 'Ex reach-outs', targetWeek: 7 },
  { id: 'hinge_checks', label: 'Hinge checks', targetWeek: 7 },
]

interface WeeklyMetricsChecklistProps {
  initialChecks?: Record<string, boolean>
  onToggle?: (id: string, checked: boolean) => Promise<void>
}

export function WeeklyMetricsChecklist({
  initialChecks = {},
  onToggle,
}: WeeklyMetricsChecklistProps) {
  const [checks, setChecks] = useState<Record<string, boolean>>(initialChecks)
  const [syncing, setSyncing] = useState<Set<string>>(new Set())

  const handleToggle = useCallback(
    async (id: string) => {
      const newChecked = !checks[id]
      // Optimistic update
      setChecks((prev) => ({ ...prev, [id]: newChecked }))
      setSyncing((prev) => new Set(prev).add(id))

      try {
        if (onToggle) {
          await onToggle(id, newChecked)
        }
      } catch (error) {
        console.error(`Error toggling ${id}:`, error)
        // Revert on error
        setChecks((prev) => ({ ...prev, [id]: checks[id] }))
      } finally {
        setSyncing((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    },
    [checks, onToggle]
  )

  const completedCount = Object.values(checks).filter(Boolean).length
  const completionPercentage = Math.round((completedCount / METRICS.length) * 100)

  return (
    <div className="space-y-6">
      {/* Completion indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E29578] transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
        <span className="text-sm font-medium text-stone-600 ml-4 whitespace-nowrap">
          {completedCount}/{METRICS.length}
        </span>
      </div>

      {/* Metrics grid */}
      <div className="space-y-3">
        {METRICS.map((metric) => (
          <div
            key={metric.id}
            className={`flex items-center gap-3 py-3 px-4 rounded-lg border-2 transition-all ${
              checks[metric.id]
                ? 'bg-[#E29578]/10 border-[#E29578]'
                : 'bg-[#F4EBD0] border-stone-300'
            } ${syncing.has(metric.id) ? 'opacity-60' : 'opacity-100'}`}
          >
            <button
              onClick={() => handleToggle(metric.id)}
              disabled={syncing.has(metric.id)}
              className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                checks[metric.id]
                  ? 'border-[#E29578] bg-[#E29578]'
                  : 'border-stone-400 bg-white hover:border-stone-600'
              }`}
              aria-label={`Mark ${metric.label} done`}
            >
              {checks[metric.id] && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
            <span className="text-sm text-stone-700 flex-1">{metric.label}</span>
            <span className="text-xs text-stone-500">
              {checks[metric.id] ? '✓' : '○'}
            </span>
          </div>
        ))}
      </div>

      {/* Completion message */}
      {completionPercentage === 100 && (
        <div className="mt-6 p-4 bg-[#E29578]/10 border border-[#E29578] rounded-lg">
          <p className="text-sm text-stone-700 font-medium">
            You crushed it this week! All metrics complete.
          </p>
        </div>
      )}
    </div>
  )
}
