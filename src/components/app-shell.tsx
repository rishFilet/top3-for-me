'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Today', href: '/', icon: 'today' },
  { label: 'Dump', href: '/brain-dump', icon: 'edit_note' },
  { label: 'Rituals', href: '/routines', icon: 'auto_awesome' },
  { label: 'Weekly', href: '/weekly', icon: 'calendar_view_week' },
  { label: 'Plan', href: '/plan', icon: 'event_note' },
  { label: 'Reflect', href: '/reflect', icon: 'inventory_2' },
  { label: 'Settings', href: '/settings', icon: 'settings' },
]

interface AppShellProps {
  children: React.ReactNode
  userInitial?: string
}

export function AppShell({ children, userInitial = 'U' }: AppShellProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex bg-[#fdf9ee]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-[#F4EBD0] border-r-2 border-stone-800 shadow-[4px_0px_0px_0px_rgba(229,217,182,1)] p-4 gap-4 z-50">
        {/* Brand Header */}
        <div className="mb-8 px-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#d4e7db] border-2 border-stone-800 flex items-center justify-center text-stone-800 font-bold text-sm shrink-0">
            {userInitial}
          </div>
          <div>
            <h2 className="font-['Newsreader'] text-xl font-bold text-[#E29578]">Daily Journal</h2>
            <p className="text-xs text-stone-500">Stay Focused</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-['Newsreader'] text-lg transition-all ${
                  isActive
                    ? 'bg-[#E29578] text-white border-2 border-stone-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-0.5 translate-y-0.5'
                    : 'text-stone-700 border-2 border-transparent hover:bg-[#83C5BE]/10 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(131,197,190,0.5)]'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#F4EBD0] border-t-2 border-stone-800 z-50">
        <div className="flex justify-around">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-3 px-2 flex-1 text-xs font-['Newsreader'] transition-colors ${
                  isActive ? 'text-[#E29578] font-bold' : 'text-stone-600'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  )
}
