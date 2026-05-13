'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    await signIn('google', { callbackUrl: '/' })
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-6"
      style={{ background: 'linear-gradient(160deg, #fdf9ee 0%, #f5ede0 60%, #edddd0 100%)' }}
    >
      {/* Decorative top strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ background: 'linear-gradient(90deg, #E29578, #83C5BE)' }}
      />

      <div className="w-full max-w-sm flex flex-col items-center text-center gap-8">
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md"
          style={{ background: 'linear-gradient(135deg, #E29578 0%, #d4836a 100%)' }}
        >
          <span className="text-2xl text-white select-none">✦</span>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-3">
          <p
            className="text-xs font-medium tracking-[0.2em] uppercase"
            style={{ color: '#E29578' }}
          >
            Welcome to
          </p>
          <h1
            className="text-4xl leading-tight"
            style={{ fontFamily: 'var(--font-heading)', color: '#1c1c15', fontWeight: 500 }}
          >
            Top3 for Me
          </h1>
          <p
            className="text-sm leading-relaxed"
            style={{ color: '#5a5a4a' }}
          >
            Your daily three. Morning clarity,<br />evening reflection.
          </p>
        </div>

        {/* Auth card */}
        <div
          className="w-full rounded-2xl p-6 flex flex-col gap-4 shadow-sm"
          style={{
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(194,168,140,0.3)',
          }}
        >
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 rounded-xl py-3 px-4 text-sm font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
            style={{
              background: isLoading ? '#f0ebe3' : '#1c1c15',
              color: '#ffffff',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {isLoading ? 'Signing in…' : 'Continue with Google'}
          </button>

          <p className="text-center text-xs" style={{ color: '#9a9080' }}>
            Sign in once — stay signed in for 30 days
          </p>
        </div>

        <p className="text-xs" style={{ color: '#b0a898' }}>
          Your priorities, your pace.
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
