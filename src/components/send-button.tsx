'use client'

import { useState } from 'react'

interface SendButtonProps {
  onSend: () => Promise<void>
  sentAt: string | null
}

export function SendButton({ onSend, sentAt }: SendButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await onSend()
    } finally {
      setIsLoading(false)
    }
  }

  const sentTime = sentAt
    ? new Date(sentAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="w-full py-4 bg-[#E29578] text-white border-2 border-stone-800 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-1 active:translate-x-1 transition-all font-['Newsreader'] text-lg disabled:opacity-50"
    >
      {isLoading ? 'Sending...' : sentTime ? `Sent at ${sentTime}` : 'Send to Display'}
    </button>
  )
}
