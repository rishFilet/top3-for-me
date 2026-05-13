'use client'

import { usePathname, useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Today', href: '/' },
  { label: 'Rituals', href: '/routines' },
  { label: 'Weekly', href: '/weekly' },
  { label: 'Reflect', href: '/reflect' },
  { label: 'Settings', href: '/settings' },
]

export function NavBar() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-[#c3c8c3] bg-[#fbf9f7] safe-area-inset-bottom">
      <div className="max-w-2xl mx-auto flex justify-around py-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              pathname === item.href
                ? 'text-[#4e6057] font-semibold'
                : 'text-[#737874]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
