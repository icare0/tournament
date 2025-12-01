import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Users, Shield, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center gap-8 py-24 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Premium Tournament
            <span className="block text-primary">Management Platform</span>
          </h1>
          <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
            Professional esports tournament organization made simple. Create, manage, and spectate
            competitive gaming events.
          </p>
        </div>

        <div className="flex gap-4">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Get Started
            </Button>
          </Link>
          <Link href="/tournaments">
            <Button size="lg" variant="outline">
              View Tournaments
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container py-24">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <Trophy className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Multiple Formats</CardTitle>
              <CardDescription>
                Support for Single/Double Elimination, Round Robin, Swiss, and more
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Organize players, manage registrations, and track participation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Secure Payments</CardTitle>
              <CardDescription>
                Built-in wallet system with double-entry accounting for prize distribution
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Real-time Updates</CardTitle>
              <CardDescription>
                Live match scores, brackets, and notifications via WebSocket
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  )
}
