'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DeviceToken } from '@/lib/types'
import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  const router = useRouter()
  const [tokens, setTokens] = useState<DeviceToken[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingToken, setGeneratingToken] = useState(false)
  const [newTokenLabel, setNewTokenLabel] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch('/api/device-tokens')
        if (res.status === 401) {
          router.push('/login')
          return
        }
        const data = await res.json()
        setTokens(data)
      } catch (error) {
        console.error('Error fetching device tokens:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTokens()
  }, [router])

  const handleGenerateToken = async () => {
    setGeneratingToken(true)
    try {
      const res = await fetch('/api/device-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newTokenLabel || null }),
      })
      const newToken = await res.json()
      setTokens([newToken, ...tokens])
      setNewTokenLabel('')
      navigator.clipboard.writeText(newToken.token)
      setCopiedId(newToken.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Error generating token:', error)
    } finally {
      setGeneratingToken(false)
    }
  }

  const handleCopyToken = async (token: string, id: string) => {
    try {
      await navigator.clipboard.writeText(token)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Error copying token:', error)
    }
  }

  const handleDeleteToken = async (id: string) => {
    if (!confirm('Delete this device token?')) return
    try {
      await fetch(`/api/device-tokens?id=${id}`, { method: 'DELETE' })
      setTokens(tokens.filter((t) => t.id !== id))
    } catch (error) {
      console.error('Error deleting token:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <AppShell userInitial="R">
      <div className="p-6 md:p-10 max-w-3xl">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 pb-8 border-b-2 border-stone-200">
          <div className="flex-1">
            <h1 className="font-['Newsreader'] text-4xl md:text-5xl text-stone-800 mt-2 mb-3">
              Settings
            </h1>
            <p className="text-stone-500 text-base">
              Manage your device tokens and display settings.
            </p>
          </div>
        </div>

        {/* Device Tokens */}
        <div className="space-y-6">
          <div>
            <h2 className="font-['Newsreader'] text-2xl text-stone-800 mb-4">Device Tokens</h2>

            {/* Generate Token Form */}
            <div className="bg-[#F4EBD0] border-2 border-stone-600 rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(229,217,182,1)] space-y-4 mb-6">
              <div>
                <label className="text-xs font-medium text-stone-500 uppercase tracking-wide block mb-2">
                  Device Name (optional)
                </label>
                <Input
                  value={newTokenLabel}
                  onChange={(e) => setNewTokenLabel(e.target.value)}
                  placeholder="e.g., Kitchen Display"
                  className="rounded-xl border-stone-400 bg-white text-stone-800"
                />
              </div>
              <button
                onClick={handleGenerateToken}
                disabled={generatingToken}
                className="w-full py-3 bg-[#E29578] text-white border-2 border-stone-800 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-1 active:translate-x-1 transition-all font-['Newsreader'] text-base disabled:opacity-50"
              >
                {generatingToken ? 'Generating...' : 'Generate New Token'}
              </button>
            </div>

            {/* Token List */}
            <div className="space-y-4">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="bg-[#F4EBD0] border-2 border-stone-400 rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(229,217,182,1)]"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-['Newsreader'] text-lg font-semibold text-stone-800">
                          {token.label || 'Unnamed Device'}
                        </h3>
                        <p className="text-xs text-stone-500 font-mono mt-2">
                          {token.token.slice(0, 8)}...{token.token.slice(-8)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyToken(token.token, token.id)}
                          className="px-4 py-2 text-sm text-stone-800 bg-[#d4e7db] border-2 border-stone-400 rounded-lg hover:border-stone-600 transition-all"
                        >
                          {copiedId === token.id ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={() => handleDeleteToken(token.id)}
                          className="px-4 py-2 text-sm text-red-600 bg-[#fedada] border-2 border-red-400 rounded-lg hover:border-red-600 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {token.lastPolledAt && (
                      <p className="text-xs text-stone-500">
                        Last polled: {new Date(token.lastPolledAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {tokens.length === 0 && (
                <p className="text-sm text-stone-600">
                  No device tokens yet. Create one to use with external displays.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
