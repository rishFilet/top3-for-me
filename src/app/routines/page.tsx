'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Routine, RoutineStep } from '@/lib/types'
import { AppShell } from '@/components/app-shell'
import { Input } from '@/components/ui/input'

export default function RoutinesPage() {
  const router = useRouter()
  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'morning' as 'morning' | 'evening',
    steps: [{ label: '', durationMinutes: null as number | null }],
  })

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const res = await fetch('/api/routines')
        if (res.status === 401) {
          router.push('/login')
          return
        }
        const data = await res.json()
        setRoutines(data)
      } catch (error) {
        console.error('Error fetching routines:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRoutines()
  }, [router])

  const handleAddStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { label: '', durationMinutes: null }],
    })
  }

  const handleRemoveStep = (index: number) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const newRoutine = await res.json()
      setRoutines([newRoutine, ...routines])
      setShowForm(false)
      setFormData({
        name: '',
        type: 'morning',
        steps: [{ label: '', durationMinutes: null as number | null }],
      })
    } catch (error) {
      console.error('Error creating routine:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this routine?')) return
    try {
      await fetch(`/api/routines/${id}`, { method: 'DELETE' })
      setRoutines(routines.filter((r) => r.id !== id))
    } catch (error) {
      console.error('Error deleting routine:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <AppShell userInitial="R">
      <div className="p-6 md:p-10 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b-2 border-stone-300 pb-6">
          <div>
            <h1 className="font-['Newsreader'] text-4xl text-stone-800 mb-2">
              Morning Rituals
            </h1>
            <p className="text-stone-500">Set your intentions for a focused day.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-[#d2e1f7] text-stone-800 border-2 border-stone-800 rounded-lg shadow-[4px_4px_0px_0px_rgba(175,168,143,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-1 active:translate-x-1 transition-all text-sm font-medium"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            {showForm ? 'Cancel' : 'New Ritual'}
          </button>
        </div>

        {/* Form (when open) */}
        {showForm && (
          <div className="bg-[#F4EBD0] border-2 border-stone-600 rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(229,217,182,1)] mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-stone-500 uppercase tracking-wide block mb-1">
                  Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Morning Ramp"
                  className="rounded-xl border-stone-400 bg-white text-stone-800"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-500 uppercase tracking-wide block mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'morning' | 'evening',
                    })
                  }
                  className="w-full p-2 rounded-xl border border-stone-400 bg-white text-stone-800"
                >
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-500 uppercase tracking-wide block">
                  Steps
                </label>
                {formData.steps.map((step, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={step.label}
                      onChange={(e) => {
                        const newSteps = [...formData.steps]
                        newSteps[i].label = e.target.value
                        setFormData({ ...formData, steps: newSteps })
                      }}
                      placeholder="Step label"
                      className="flex-1 rounded-xl border-stone-400 bg-white text-stone-800"
                    />
                    <Input
                      type="number"
                      value={step.durationMinutes || ''}
                      onChange={(e) => {
                        const newSteps = [...formData.steps]
                        newSteps[i].durationMinutes = e.target.value
                          ? parseInt(e.target.value)
                          : null
                        setFormData({ ...formData, steps: newSteps })
                      }}
                      placeholder="Min"
                      className="w-16 rounded-xl border-stone-400 bg-white text-stone-800"
                    />
                    <button
                      onClick={() => handleRemoveStep(i)}
                      type="button"
                      className="px-2 text-stone-500 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddStep}
                  type="button"
                  className="w-full py-2 text-sm text-stone-700 border border-stone-400 rounded-xl hover:bg-white"
                >
                  + Add Step
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-[#E29578] text-white border-2 border-stone-800 rounded-xl py-3 font-medium text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-1 active:translate-x-1 transition-all"
              >
                Create Ritual
              </button>
            </form>
          </div>
        )}

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main focus card - first routine spans 8 cols */}
          {routines.slice(0, 1).map((routine) => (
            <div
              key={routine.id}
              className="md:col-span-8 bg-[#F4EBD0] border-2 border-stone-600 rounded-xl p-8 shadow-[6px_6px_0px_0px_rgba(229,217,182,1)] flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Newsreader'] text-2xl text-stone-800">{routine.name}</h2>
                <span className="text-xs px-3 py-1 bg-[#d4e7db] text-stone-700 border border-stone-400 rounded-full capitalize">
                  {routine.type}
                </span>
              </div>
              <ul className="space-y-3 flex-1">
                {routine.steps.map((step) => (
                  <li key={step.id} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded border-2 border-stone-400 bg-[#fdf9ee] shrink-0" />
                    <span className="text-stone-700">{step.label}</span>
                    {step.durationMinutes && (
                      <span className="ml-auto text-xs text-stone-400 shrink-0">
                        {step.durationMinutes}m
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleDelete(routine.id)}
                className="mt-6 text-xs text-red-400 hover:text-red-600 self-start"
              >
                Delete
              </button>
            </div>
          ))}

          {/* Remaining routines as smaller cards spanning 4 cols */}
          {routines.slice(1).map((routine) => (
            <div
              key={routine.id}
              className="md:col-span-4 bg-[#F4EBD0] border-2 border-stone-400 rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(229,217,182,1)] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-['Newsreader'] text-xl text-stone-800">{routine.name}</h3>
                <span className="text-xs px-2 py-0.5 bg-[#d4e7db] text-stone-600 rounded-full capitalize">
                  {routine.type}
                </span>
              </div>
              <ul className="space-y-2 flex-1">
                {routine.steps.map((step) => (
                  <li key={step.id} className="flex items-center gap-2 text-sm text-stone-700">
                    <div className="w-4 h-4 rounded border border-stone-400 shrink-0" />
                    {step.label}
                    {step.durationMinutes && (
                      <span className="ml-auto text-xs text-stone-400">{step.durationMinutes}m</span>
                    )}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleDelete(routine.id)}
                className="mt-4 text-xs text-red-400 hover:text-red-600 self-start"
              >
                Delete
              </button>
            </div>
          ))}

          {routines.length === 0 && (
            <div className="md:col-span-12 text-center py-16 text-stone-400">
              <span className="material-symbols-outlined text-5xl mb-4 block">
                auto_awesome
              </span>
              <p>No rituals yet. Create your first ritual to get started.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
