'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Trophy, Users, Calendar, DollarSign, Filter, Sparkles, Zap, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api-client'

// Game artwork configuration
const GAMES = [
  {
    id: 'cs2',
    name: 'Counter-Strike 2',
    slug: 'cs2',
    color: 'from-orange-500 to-yellow-600',
    artwork: '/games/cs2.jpg',
    icon: '🎯',
    playerCount: 'Coming Soon',
  },
  {
    id: 'valorant',
    name: 'Valorant',
    slug: 'valorant',
    color: 'from-red-500 to-pink-600',
    artwork: '/games/valorant.jpg',
    icon: '⚡',
    playerCount: 'Coming Soon',
  },
  {
    id: 'league',
    name: 'League of Legends',
    slug: 'league-of-legends',
    color: 'from-blue-500 to-cyan-600',
    artwork: '/games/league.jpg',
    icon: '⚔️',
    playerCount: 'Coming Soon',
  },
  {
    id: 'rocket',
    name: 'Rocket League',
    slug: 'rocket-league',
    color: 'from-blue-600 to-purple-600',
    artwork: '/games/rocket.jpg',
    icon: '🚀',
    playerCount: 'Coming Soon',
  },
  {
    id: 'fortnite',
    name: 'Fortnite',
    slug: 'fortnite',
    color: 'from-purple-600 to-pink-600',
    artwork: '/games/fortnite.jpg',
    icon: '🌟',
    playerCount: 'Coming Soon',
  },
  {
    id: 'dota',
    name: 'Dota 2',
    slug: 'dota-2',
    color: 'from-red-600 to-orange-600',
    artwork: '/games/dota.jpg',
    icon: '🔥',
    playerCount: 'Coming Soon',
  },
]

interface Tournament {
  id: string
  name: string
  game: string
  type: string
  status: string
  visibility: string
  maxParticipants: number
  prizePool: number | null
  entryFee: number
  startDate: string
  organizer: {
    username: string
    avatar: string | null
  }
  _count?: {
    participants: number
  }
}

export default function DiscoverPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGame, setSelectedGame] = useState<string>('all')
  const [hoveredGame, setHoveredGame] = useState<string | null>(null)

  useEffect(() => {
    fetchTournaments()
  }, [selectedGame])

  const fetchTournaments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        visibility: 'PUBLIC',
        ...(selectedGame !== 'all' && { game: selectedGame }),
      })

      const response = await api.get(`/api/v1/tournaments?${params}`)
      setTournaments(response.data?.data || [])
    } catch (error) {
      console.error('Error fetching tournaments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTournaments = tournaments.filter(
    (tournament) =>
      tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament.game.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-bloom-bg text-bloom-dark antialiased">
      {/* Noise Overlay */}
      <div className="noise-overlay" />

      {/* Hero Section - Premium Beta Launch */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-bloom-accent/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-bloom-sage/20 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          {/* Beta Badge */}
          <div className="inline-flex items-center gap-3 mb-6 reveal-up">
            <span className="h-[1px] w-8 bg-bloom-dark/30" />
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-bloom-dark/5 border border-bloom-dark/10">
              <Sparkles className="h-3 w-3 text-bloom-accent animate-pulse" />
              <span className="font-sans text-xs tracking-[0.3em] uppercase text-bloom-dark/70">
                Beta Access
              </span>
            </div>
            <span className="h-[1px] w-8 bg-bloom-dark/30" />
          </div>

          {/* Main Title */}
          <h1 className="font-serif text-6xl md:text-8xl italic text-bloom-dark mb-6 reveal-up delay-100">
            Découvrez <br />
            <span className="not-italic relative inline-block">
              Votre Tournoi
              <span className="absolute -top-6 -right-12 text-4xl md:text-6xl not-italic font-sans text-bloom-accent animate-bounce">
                *
              </span>
            </span>
          </h1>

          <p className="font-sans text-lg md:text-xl text-bloom-dark/60 mt-6 mb-12 max-w-3xl mx-auto reveal-up delay-200">
            La première plateforme où l'excellence rencontre l'organisation. <br />
            Rejoignez les pionniers de la compétition premium.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center reveal-up delay-300">
            <Link
              href="/register"
              className="bg-bloom-dark text-bloom-bg px-10 py-4 rounded-none font-sans text-sm uppercase tracking-[0.2em] hover:bg-bloom-accent transition-all duration-300 hover:scale-105"
            >
              Rejoindre la Beta
            </Link>
            <Link
              href="#browse"
              className="flex items-center gap-2 px-8 py-4 font-sans text-sm uppercase tracking-[0.2em] text-bloom-dark hover:opacity-70 transition-opacity border border-bloom-dark/20 hover:border-bloom-dark/40"
            >
              <TrendingUp className="h-4 w-4" />
              Explorer
            </Link>
          </div>

          {/* Stats Bar - Coming Soon Teaser */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto reveal-up delay-400">
            {[
              { icon: '🎮', label: 'Jeux Supportés', value: '6+' },
              { icon: '🏆', label: 'Tournois à Venir', value: 'Soon' },
              { icon: '👥', label: 'Rejoignez-nous', value: 'Beta' },
              { icon: '💎', label: 'Prize Pools', value: 'Soon' },
            ].map((stat, i) => (
              <div key={i} className="text-center group cursor-default">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <p className="font-serif text-2xl italic mb-1">{stat.value}</p>
                <p className="font-sans text-xs uppercase tracking-wider text-bloom-dark/50">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Navigation - Premium Cards */}
      <section id="browse" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-[1px] w-12 bg-bloom-dark/30" />
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-bloom-dark/60">
                Choisissez Votre Arène
              </p>
              <span className="h-[1px] w-12 bg-bloom-dark/30" />
            </div>
            <h2 className="font-serif text-4xl md:text-6xl italic text-bloom-dark">
              Par Jeu
            </h2>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {GAMES.map((game, index) => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.slug)}
                onMouseEnter={() => setHoveredGame(game.id)}
                onMouseLeave={() => setHoveredGame(null)}
                className={`group relative h-64 rounded-lg overflow-hidden border-2 transition-all duration-500 reveal-up ${
                  selectedGame === game.slug
                    ? 'border-bloom-accent scale-105 shadow-2xl'
                    : 'border-bloom-dark/10 hover:border-bloom-dark/30 hover:scale-102'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-20 group-hover:opacity-30 transition-opacity`}
                />

                {/* Artwork Background - Placeholder */}
                <div className="absolute inset-0 bg-bloom-dark/5" />

                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
                  {/* Icon */}
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                    {game.icon}
                  </div>

                  {/* Game Name */}
                  <h3 className="font-serif text-2xl italic mb-2">{game.name}</h3>

                  {/* Player Count Badge */}
                  <div className="px-3 py-1 rounded-full bg-bloom-dark/10 border border-bloom-dark/20 backdrop-blur-sm">
                    <p className="font-sans text-xs uppercase tracking-wider text-bloom-dark/70">
                      {game.playerCount}
                    </p>
                  </div>

                  {/* Hover Effect - Glow */}
                  {hoveredGame === game.id && (
                    <div className="absolute inset-0 border-2 border-bloom-accent/50 rounded-lg animate-pulse" />
                  )}
                </div>

                {/* Selected Indicator */}
                {selectedGame === game.slug && (
                  <div className="absolute top-4 right-4">
                    <div className="w-3 h-3 bg-bloom-accent rounded-full" />
                    <div className="absolute inset-0 bg-bloom-accent rounded-full animate-ping opacity-75" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tournaments List Section */}
      <section className="py-20 px-4 bg-bloom-dark/[0.02]">
        <div className="max-w-7xl mx-auto">
          {/* Search & Filters */}
          <div className="mb-12">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-bloom-dark/40" />
              <Input
                type="text"
                placeholder="Rechercher un tournoi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-6 bg-white/80 backdrop-blur-sm border-2 border-bloom-dark/10 focus:border-bloom-accent rounded-lg font-sans text-base transition-all"
              />
            </div>
          </div>

          {/* Tournaments Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-16 h-16 border-4 border-bloom-dark/20 border-t-bloom-accent rounded-full animate-spin" />
              <p className="font-sans text-sm uppercase tracking-wider text-bloom-dark/50 mt-4">
                Chargement...
              </p>
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="text-center py-20">
              <div className="mb-6">
                <Trophy className="h-16 w-16 text-bloom-dark/20 mx-auto" />
              </div>
              <p className="font-serif text-3xl italic text-bloom-dark/40 mb-4">
                Bientôt Disponible
              </p>
              <p className="font-sans text-sm text-bloom-dark/50 max-w-md mx-auto">
                Les tournois arrivent très prochainement. Inscrivez-vous pour être notifié dès leur lancement.
              </p>
              <Link
                href="/register"
                className="inline-block mt-8 bg-bloom-dark text-bloom-bg px-8 py-3 rounded-none font-sans text-xs uppercase tracking-[0.2em] hover:bg-bloom-accent transition-colors"
              >
                Me Notifier
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments.map((tournament, index) => (
                <Link
                  key={tournament.id}
                  href={`/tournaments/${tournament.id}`}
                  className="group reveal-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="h-full p-6 bg-white/60 backdrop-blur-sm border-2 border-bloom-dark/10 rounded-lg hover:border-bloom-accent hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-serif text-2xl italic group-hover:text-bloom-accent transition-colors">
                          {tournament.name}
                        </h3>
                        <p className="font-sans text-xs uppercase tracking-wider text-bloom-dark/50 mt-1">
                          {tournament.game}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-sans uppercase tracking-wider border border-green-500/20">
                        {tournament.status === 'REGISTRATION_OPEN' ? 'Open' : tournament.status}
                      </span>
                    </div>

                    {/* Info Grid */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm">
                        <Users className="h-4 w-4 text-bloom-dark/40" />
                        <span className="font-sans text-bloom-dark/70">
                          {tournament._count?.participants || 0}/{tournament.maxParticipants} Joueurs
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-bloom-dark/40" />
                        <span className="font-sans text-bloom-dark/70">
                          {new Date(tournament.startDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      {tournament.prizePool && tournament.prizePool > 0 && (
                        <div className="flex items-center gap-3 text-sm">
                          <Trophy className="h-4 w-4 text-bloom-accent" />
                          <span className="font-sans font-medium text-bloom-accent">
                            ${tournament.prizePool} Prize Pool
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-sm">
                        <DollarSign className="h-4 w-4 text-bloom-dark/40" />
                        <span className="font-sans text-bloom-dark/70">
                          {tournament.entryFee > 0 ? `$${tournament.entryFee}` : 'GRATUIT'}
                        </span>
                      </div>
                    </div>

                    {/* Organizer */}
                    <div className="pt-4 border-t border-bloom-dark/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-bloom-accent to-bloom-sage" />
                        <span className="font-sans text-xs text-bloom-dark/60">
                          {tournament.organizer.username}
                        </span>
                      </div>
                      <Zap className="h-4 w-4 text-bloom-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
