'use client'

import { Textarea } from '@/components/ui/textarea'

interface PriorityCardProps {
  value: string | null
  onChange: (value: string) => void
  label: string
  number: number
  placeholder?: string
  icon?: string
  badgeText?: string
}

export function PriorityCard({
  value,
  onChange,
  label,
  number,
  placeholder,
  icon = 'draw',
  badgeText,
}: PriorityCardProps) {
  const numStr = String(number).padStart(2, '0')

  return (
    <div className="bg-[#fdf9ee] border-2 border-stone-600 rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(229,217,182,1)] relative flex flex-col h-full hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[6px_6px_0px_0px_rgba(212,231,219,1)] transition-all cursor-pointer group">
      {/* Number badge - top right */}
      <div className="absolute top-4 right-4 text-5xl font-['Newsreader'] text-stone-300 opacity-40 group-hover:opacity-100 transition-opacity leading-none select-none">
        {numStr}
      </div>
      {/* Icon */}
      <div className="inline-flex w-8 h-8 rounded border-2 border-stone-600 items-center justify-center bg-[#d4e7db] text-stone-700 mb-4 shadow-[2px_2px_0px_0px_rgba(195,200,195,1)]">
        <span className="material-symbols-outlined text-sm">{icon}</span>
      </div>
      {/* Label */}
      <label className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2 block">
        {label}
      </label>
      {/* Textarea */}
      <Textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Add your priority...'}
        className="bg-transparent border-none shadow-none resize-none p-0 text-stone-800 placeholder:text-stone-400 focus-visible:ring-0 flex-1 min-h-[80px] font-['Be_Vietnam_Pro']"
      />
      {/* Badge footer */}
      {badgeText && (
        <div className="mt-4 pt-4 border-t-2 border-stone-200 flex items-center justify-between">
          <span className="text-xs font-medium text-[#E29578]">{badgeText}</span>
          <span className="material-symbols-outlined text-stone-400 text-sm">
            check_circle
          </span>
        </div>
      )}
    </div>
  )
}
