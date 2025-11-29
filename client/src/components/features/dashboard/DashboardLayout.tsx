'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Menu, X, Home, Trophy, Calendar, Settings, Users, BarChart } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Trophy, label: 'Tournaments', href: '/dashboard/tournaments' },
    { icon: Calendar, label: 'Schedule', href: '/dashboard/schedule' },
    { icon: Users, label: 'Participants', href: '/dashboard/participants' },
    { icon: BarChart, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300',
          isSidebarOpen ? 'w-64' : 'w-20',
          'lg:relative lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          {isSidebarOpen && (
            <h1 className="text-xl font-bold gradient-gaming-text">
              Tournament
            </h1>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                    'hover:bg-accent hover:text-accent-foreground',
                    'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  {isSidebarOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gaming-purple flex items-center justify-center text-white font-semibold">
              U
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">User Name</p>
                <p className="text-xs text-muted-foreground truncate">Organizer</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={cn('flex-1 overflow-y-auto', className)}>
        {/* Header */}
        <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-full items-center justify-between px-6">
            <h2 className="text-2xl font-semibold">Mission Control</h2>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-gaming-purple text-white rounded-lg hover:bg-gaming-purple/90 transition-colors">
                New Tournament
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
