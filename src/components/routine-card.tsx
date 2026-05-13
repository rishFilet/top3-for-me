'use client'

import { Routine } from '@/lib/types'
import { ChevronDown } from 'lucide-react'

interface RoutineCardProps {
  routine: Routine | null
  isExpanded: boolean
  onToggle: () => void
}

export function RoutineCard({ routine, isExpanded, onToggle }: RoutineCardProps) {
  if (!routine) {
    return (
      <div className="rounded-2xl border border-[#c3c8c3] bg-[#f5f3f1] p-4">
        <p className="text-sm text-[#737874]">No routine scheduled</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[#c3c8c3] bg-[#f5f3f1] p-4">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center text-left"
      >
        <h3 className="font-serif text-lg font-semibold text-[#1b1c1b]">{routine.name}</h3>
        <ChevronDown
          size={20}
          className={`transition-transform flex-shrink-0 text-[#424844] ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-2">
          {routine.steps.map((step) => (
            <div
              key={step.id}
              className="flex justify-between items-center py-2 border-b border-[#eae8e6] last:border-0"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-[#c3c8c3]">●</span>
                <span className="text-sm text-[#1b1c1b]">{step.label}</span>
              </div>
              {step.durationMinutes && (
                <span className="text-xs bg-[#eae8e6] text-[#424844] px-2 py-1 rounded-full">{step.durationMinutes}m</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
