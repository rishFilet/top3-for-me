'use client'

import { useState, useCallback, useRef } from 'react'
import { AppShell } from '@/components/app-shell'

interface AiSuggestion {
  id: string
  category: string
  categoryIcon: string
  excerpt: string
  accepted: boolean | null
}

const PLACEHOLDER_TEXT =
  'Need to finish the quarterly report by Friday. Don\'t forget to buy milk and those fancy coffee beans from the local roaster. Idea for new project: integrating a music player into the study timer. Call mom this weekend. Schedule a meeting with Sarah about the Q3 design updates. Maybe start reading that new sci-fi book tonight?'

function mockAiSort(text: string): AiSuggestion[] {
  const sentences = text
    .split(/[.\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const suggestions: AiSuggestion[] = []

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase()
    let category = ''
    let icon = ''

    if (/finish|deadline|report|meeting|schedule|project|deliver|submit|review|update/i.test(lower)) {
      category = 'Priority'
      icon = 'push_pin'
    } else if (/buy|milk|grocery|store|coffee|beans|shop|order|pick up/i.test(lower)) {
      category = 'Shopping List'
      icon = 'shopping_cart'
    } else if (/idea|integrating|maybe|what if|could|new feature|concept/i.test(lower)) {
      category = 'Ideas'
      icon = 'lightbulb'
    } else if (/call|mom|dad|friend|weekend|personal|book|read|watch|play/i.test(lower)) {
      category = 'Personal'
      icon = 'person'
    } else {
      category = 'Notes'
      icon = 'note'
    }

    suggestions.push({
      id: Math.random().toString(36).slice(2),
      category,
      categoryIcon: icon,
      excerpt: sentence.length > 80 ? sentence.slice(0, 77) + '...' : sentence,
      accepted: null,
    })
  }

  return suggestions
}

export default function BrainDumpPage() {
  const [notes, setNotes] = useState('')
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([])
  const [processing, setProcessing] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const saveTimer = useRef<NodeJS.Timeout | null>(null)

  const handleNotesChange = useCallback((value: string) => {
    setNotes(value)
    setAutoSaveStatus('saving')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => setAutoSaveStatus('saved'), 800)
  }, [])

  const handleSort = () => {
    if (!notes.trim()) return
    setProcessing(true)
    setTimeout(() => {
      setSuggestions(mockAiSort(notes))
      setProcessing(false)
    }, 1200)
  }

  const handleAccept = (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, accepted: true } : s))
    )
  }

  const handleDismiss = (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, accepted: false } : s))
    )
  }

  const pendingSuggestions = suggestions.filter((s) => s.accepted === null)
  const acceptedSuggestions = suggestions.filter((s) => s.accepted === true)

  return (
    <AppShell userInitial="R">
      <div className="p-6 md:p-10 max-w-4xl">
        {/* Header */}
        <div className="mb-10 pb-8 border-b-2 border-stone-200">
          <span className="text-xs text-stone-400 uppercase tracking-widest">Brain Dump</span>
          <h1 className="font-['Newsreader'] text-4xl md:text-5xl text-stone-800 mt-2 mb-3">
            Just write.
          </h1>
          <p className="text-stone-500 text-base">
            We'll make sense of it later. Get everything out of your head first.
          </p>
        </div>

        {/* Dump Zone */}
        <section className="mb-8">
          <div className="relative bg-[#F4EBD0] border-2 border-stone-800 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#E29578] text-xl">edit_note</span>
                <span className="font-['Newsreader'] text-lg text-stone-700">Dump Zone</span>
              </div>
              {autoSaveStatus !== 'idle' && (
                <span className="text-xs text-stone-400 italic">
                  {autoSaveStatus === 'saving' ? 'Saving...' : '✓ Saved'}
                </span>
              )}
            </div>
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder={PLACEHOLDER_TEXT}
              className="w-full min-h-[220px] bg-transparent text-stone-700 text-base leading-relaxed resize-none outline-none placeholder:text-stone-400 placeholder:italic font-sans"
            />
          </div>
        </section>

        {/* Sort Button */}
        <div className="mb-10">
          <button
            onClick={handleSort}
            disabled={processing || !notes.trim()}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-stone-800 font-['Newsreader'] text-lg font-semibold transition-all
              ${
                processing || !notes.trim()
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                  : 'bg-[#83C5BE] text-stone-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
          >
            <span className="material-symbols-outlined text-xl">
              {processing ? 'hourglass_empty' : 'auto_awesome'}
            </span>
            {processing ? 'Sorting...' : 'Sort & Organize with AI'}
          </button>
        </div>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-[#E29578]">psychology</span>
              <h2 className="font-['Newsreader'] text-2xl text-stone-800">AI Suggestions</h2>
              {pendingSuggestions.length > 0 && (
                <span className="text-xs bg-[#E29578] text-white px-2 py-0.5 rounded-full font-sans font-semibold">
                  {pendingSuggestions.length}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {pendingSuggestions.map((s) => (
                <div
                  key={s.id}
                  className="bg-[#F4EBD0] border-2 border-stone-800 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-5 flex items-start gap-4"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#d4e7db] border-2 border-stone-800 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-base text-stone-700">
                      {s.categoryIcon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-stone-400 uppercase tracking-widest font-sans font-semibold">
                      {s.category}
                    </span>
                    <p className="text-stone-700 text-base mt-1 font-sans leading-relaxed">
                      "{s.excerpt}"
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleAccept(s.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-sans font-semibold bg-[#E29578] text-white border border-stone-800 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0"
                    >
                      <span className="material-symbols-outlined text-sm">check</span>
                      Accept
                    </button>
                    <button
                      onClick={() => handleDismiss(s.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-sans font-semibold bg-stone-100 text-stone-600 border border-stone-300 rounded-lg hover:bg-stone-200 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Accepted items */}
            {acceptedSuggestions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs text-stone-400 uppercase tracking-widest mb-3 font-sans font-semibold">
                  Accepted ({acceptedSuggestions.length})
                </h3>
                <div className="flex flex-col gap-2">
                  {acceptedSuggestions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 px-4 py-3 bg-[#d4e7db]/40 border border-stone-200 rounded-lg opacity-60"
                    >
                      <span className="material-symbols-outlined text-sm text-[#4e6057]">
                        check_circle
                      </span>
                      <span className="text-xs text-stone-500 font-sans uppercase tracking-wide font-semibold w-20 shrink-0">
                        {s.category}
                      </span>
                      <span className="text-sm text-stone-500 font-sans truncate">
                        {s.excerpt}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingSuggestions.length === 0 && suggestions.length > 0 && (
              <div className="mt-6 text-center py-8">
                <span className="material-symbols-outlined text-4xl text-[#83C5BE] mb-2 block">
                  task_alt
                </span>
                <p className="text-stone-500 font-['Newsreader'] text-lg">All sorted.</p>
              </div>
            )}
          </section>
        )}
      </div>
    </AppShell>
  )
}
