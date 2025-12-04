'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, DollarSign, Trophy, Activity, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminLayoutProps {
  children: ReactNode
}

const adminRoutes = [
  {
    label: 'Users',
    icon: Users,
    href: '/admin/users',
    description: 'Manage users and permissions',
  },
  {
    label: 'Financial',
    icon: DollarSign,
    href: '/admin/financial',
    description: 'Revenue and transaction analytics',
  },
  {
    label: 'Tournaments',
    icon: Trophy,
    href: '/admin/tournaments',
    description: 'Tournament moderation',
  },
  {
    label: 'System Health',
    icon: Activity,
    href: '/admin/system',
    description: 'System integrity and monitoring',
  },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-500" />
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Platform management and monitoring
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {adminRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    'flex items-start gap-3 rounded-lg px-4 py-3 transition-colors',
                    pathname === route.href
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  <route.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{route.label}</p>
                    <p className="text-xs opacity-80">{route.description}</p>
                  </div>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
