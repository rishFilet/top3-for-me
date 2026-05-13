'use client'

import { useState, useRef } from 'react'
import { BacklogItem } from '@/lib/types'

interface BacklogChecklistProps {
  items: BacklogItem[]
  onAdd: (text: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function BacklogChecklist({ items, onAdd, onDelete }: BacklogChecklistProps) {
  const [draft, setDraft] = useState('')
  const [completing, setCompleting] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAdd = async () => {
    const text = draft.trim()
    if (!text) return
    setDraft('')
    await onAdd(text)
  }

  const handleCheck = async (id: string) => {
    setCompleting((prev) => new Set(prev).add(id))
    await onDelete(id)
    setCompleting((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  return (
    <section className="mb-10">
      <label className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-4 block">
        Bonus or Defer
      </label>

      <div className="space-y-2 mb-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 py-2.5 px-4 bg-[#F4EBD0] border-2 border-stone-300 rounded-xl transition-opacity ${
              completing.has(item.id) ? 'opacity-30' : 'opacity-100'
            }`}
          >
            <button
              onClick={() => handleCheck(item.id)}
              disabled={completing.has(item.id)}
              className="w-5 h-5 rounded border-2 border-stone-400 flex-shrink-0 flex items-center justify-center hover:border-stone-600 transition-colors"
              aria-label="Mark done"
            />
            <span className="text-sm text-stone-700 flex-1">{item.text}</span>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-sm text-stone-400 italic px-1">
            Nothing deferred yet. Add things that can wait or would be a bonus.
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add something to defer or bonus..."
          className="flex-1 bg-[#F4EBD0] border-2 border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-500 transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={!draft.trim()}
          className="px-4 py-2.5 bg-[#F4EBD0] border-2 border-stone-400 rounded-xl text-stone-600 text-sm hover:border-stone-600 disabled:opacity-30 transition-all"
        >
          Add
        </button>
      </div>
    </section>
  )
}
