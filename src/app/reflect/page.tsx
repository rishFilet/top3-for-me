'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DayPlan } from '@/lib/types'
import { AppShell } from '@/components/app-shell'
import { Textarea } from '@/components/ui/textarea'

const REFLECTION_PROMPTS = [
  'One thing I did well',
  'One thing I\'m grateful for in Trinidad',
  'One thing I love about my heritage',
]

export default function ReflectPage() {
  const router = useRouter()
  const [dayPlan, setDayPlan] = useState<DayPlan | null>(null)
  const [reflections, setReflections] = useState<string[]>(['', '', ''])
  const [tomorrowDraft, setTomorrowDraft] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchDayPlan = async () => {
      try {
        const res = await fetch('/api/day-plans')
        if (res.status === 401) {
          router.push('/login')
          return
        }
        const data = await res.json()
        setDayPlan(data)
        // Parse reflectionNote if it exists (combine 3 parts or handle legacy single prompt)
        if (data?.reflectionNote) {
          const parts = data.reflectionNote.split('\n---\n')
          if (parts.length === 3) {
            setReflections(parts)
          } else {
            // Legacy single prompt - put in first position
            setReflections([data.reflectionNote, '', ''])
          }
        }
        setTomorrowDraft(data?.tomorrowDraft || '')
      } catch (error) {
        console.error('Error fetching day plan:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDayPlan()
  }, [router])

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      // Combine reflections with delimiter
      const combinedReflection = reflections.join('\n---\n')
      await fetch('/api/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reflectionNote: combinedReflection, tomorrowDraft }),
      })
      alert('Reflection saved!')
    } catch (error) {
      console.error('Error saving reflection:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <AppShell userInitial="R">
      <div className="p-6 md:p-10 max-w-3xl">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs text-stone-400 uppercase tracking-widest mb-2">Evening Ritual</p>
          <h1 className="font-['Newsreader'] text-5xl text-stone-800 mb-3">Closing the day.</h1>
        </div>

        {/* Three reflection prompts */}
        <div className="space-y-8 mb-10">
          {REFLECTION_PROMPTS.map((prompt, idx) => (
            <div key={idx}>
              <h2 className="font-['Newsreader'] text-2xl text-stone-700 italic mb-4">
                {prompt}
              </h2>
              <div className="relative group border-b-2 border-stone-300 focus-within:border-[#E29578] transition-colors pb-4">
                <Textarea
                  value={reflections[idx]}
                  onChange={(e) => {
                    const newReflections = [...reflections]
                    newReflections[idx] = e.target.value
                    setReflections(newReflections)
                  }}
                  placeholder="Begin writing..."
                  className="bg-transparent border-none shadow-none resize-none p-0 text-stone-800 placeholder:text-stone-300 focus-visible:ring-0 min-h-[120px] text-base font-['Be_Vietnam_Pro']"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Today's priorities (read-only) */}
        {(dayPlan?.priority1 || dayPlan?.priority2 || dayPlan?.priority3) && (
          <div className="mb-10">
            <h3 className="text-xs text-stone-400 uppercase tracking-widest mb-4">
              Today's Priorities
            </h3>
            <div className="space-y-3">
              {[dayPlan?.priority1, dayPlan?.priority2, dayPlan?.priority3]
                .filter(Boolean)
                .map((p, i) => (
                  <div key={i} className="flex items-start gap-4 text-stone-600">
                    <span className="font-['Newsreader'] text-2xl text-stone-300 leading-none">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="flex-1 text-sm pt-1">{p}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tomorrow draft */}
        <div className="mb-10">
          <label className="text-xs text-stone-400 uppercase tracking-widest mb-3 block">
            Tomorrow's Draft
          </label>
          <Textarea
            value={tomorrowDraft}
            onChange={(e) => setTomorrowDraft(e.target.value)}
            placeholder="Rough ideas for tomorrow..."
            className="bg-[#F4EBD0] border-2 border-stone-400 rounded-xl resize-none min-h-[100px]"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="w-full py-4 bg-[#E29578] text-white border-2 border-stone-800 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-1 active:translate-x-1 transition-all font-['Newsreader'] text-lg disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Sync & Close Day'}
        </button>
      </div>
    </AppShell>
  )
}
