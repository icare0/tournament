import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="text-lg">Tournament Platform</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/explore">
              <Button variant="ghost">Tournaments</Button>
            </Link>
            <Link href="/spectate">
              <Button variant="ghost">Spectate</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 Tournament Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
