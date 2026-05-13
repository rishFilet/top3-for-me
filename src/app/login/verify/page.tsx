'use client'

import { Card } from '@/components/ui/card'

export default function VerifyPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold mb-2">Check Your Email</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          A magic link has been sent to your email. Click it to sign in.
        </p>
      </Card>
    </div>
  )
}
