import Link from 'next/link'
import { Trophy, Zap, Users, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6">
            <span className="gradient-gaming-text">Next-Gen</span>
            <br />
            Esports Tournament Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Gérez vos tournois e-sport avec une plateforme ultra-rapide,
            immersive et professionnelle. Du bracket temps réel à l'analyse
            avancée.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-gaming-purple text-white rounded-lg font-semibold hover:bg-gaming-purple/90 transition-all hover:scale-105"
            >
              Accéder au Dashboard
            </Link>
            <Link
              href="/tournaments"
              className="px-8 py-3 glass border border-white/20 rounded-lg font-semibold hover:border-gaming-purple transition-all"
            >
              Voir les Tournois
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={Trophy}
            title="Brackets Immersifs"
            description="Visualisation ultra-rapide des arbres de tournoi avec zoom/pan. Support jusqu'à 128+ participants."
          />
          <FeatureCard
            icon={Zap}
            title="Temps Réel"
            description="Scores et mises à jour live via WebSockets. Notifications instantanées."
          />
          <FeatureCard
            icon={Users}
            title="Gestion Complète"
            description="Dashboard organisateur, gestion des litiges, système d'arbitrage intégré."
          />
          <FeatureCard
            icon={TrendingUp}
            title="Analytics Avancées"
            description="Statistiques détaillées, leaderboards, et insights pour améliorer vos tournois."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="glass rounded-2xl p-12 text-center border border-white/10">
          <h2 className="text-4xl font-bold mb-4">
            Prêt à lancer votre premier tournoi ?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Rejoignez des centaines d'organisateurs qui font confiance à notre
            plateforme.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 gradient-gaming text-white rounded-lg font-semibold hover:opacity-90 transition-all hover:scale-105"
          >
            Commencer Gratuitement
          </Link>
        </div>
      </section>
    </main>
  )
}

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="glass rounded-xl p-6 border border-white/10 hover:border-gaming-purple transition-all group">
      <div className="w-12 h-12 rounded-lg bg-gaming-purple/20 flex items-center justify-center mb-4 group-hover:bg-gaming-purple/30 transition-colors">
        <Icon className="text-gaming-purple" size={24} />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
