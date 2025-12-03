'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Trophy, Zap, Users, BarChart3, CreditCard, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  useEffect(() => {
    // Reveal animations on scroll
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active')
        }
      })
    }, observerOptions)

    document.querySelectorAll('.reveal-up').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Noise Overlay */}
      <div className="noise-overlay" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-4 pt-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-10 -right-10 w-96 h-96 bg-bloom-accent/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-bloom-sage/20 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="z-10 text-center flex flex-col items-center w-full max-w-7xl">
          <div className="flex items-center gap-4 mb-6 reveal-up delay-100 active">
            <span className="h-[1px] w-12 bg-bloom-dark"></span>
            <p className="font-sans text-xs md:text-sm tracking-[0.4em] uppercase text-bloom-green">
              SaaS pour Organisateurs
            </p>
            <span className="h-[1px] w-12 bg-bloom-dark"></span>
          </div>

          <h1 className="font-serif text-fluid-h1 italic text-bloom-dark mb-2 reveal-up delay-200 active">
            L'Art de <br />
            <span className="not-italic relative inline-block">
              la Stratégie
              <span className="absolute -top-4 -right-8 text-2xl md:text-4xl not-italic font-sans text-bloom-accent animate-bounce">
                *
              </span>
            </span>
          </h1>

          <p className="font-sans text-lg md:text-xl text-bloom-dark/60 mt-8 mb-8 max-w-2xl reveal-up delay-300 active">
            Concevez des tournois inoubliables. De la graine de l'idée à la floraison de la finale,
            Bloom vous offre les outils pour cultiver l'excellence.
          </p>

          <div className="flex flex-col md:flex-row gap-6 items-center mt-4 reveal-up delay-500 active">
            <Button
              asChild
              className="bg-bloom-dark text-bloom-bg px-10 py-6 rounded-none font-sans text-sm uppercase tracking-[0.2em] hover:bg-bloom-accent transition-colors duration-300"
            >
              <Link href="/register">Commencer Gratuitement</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="flex items-center gap-2 px-8 py-6 font-sans text-sm uppercase tracking-[0.2em] text-bloom-dark hover:opacity-70 transition-opacity"
            >
              <Link href="#features">Découvrir</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Marquee */}
      <div className="border-y border-bloom-dark/10 py-6 overflow-hidden bg-bloom-bg relative z-10">
        <div className="whitespace-nowrap animate-marquee flex gap-16 items-center opacity-60 text-bloom-dark font-sans font-bold text-xl">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6" /> TOURNOIS ESPORTS
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6" /> TEMPS RÉEL
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" /> COMMUNAUTÉ
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6" /> PAIEMENTS SÉCURISÉS
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" /> ANALYTICS PRO
          </div>
          {/* Duplicated for seamless loop */}
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6" /> TOURNOIS ESPORTS
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6" /> TEMPS RÉEL
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" /> COMMUNAUTÉ
          </div>
        </div>
      </div>

      {/* Features Bento Grid */}
      <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto" id="features">
        <div className="mb-16 md:flex justify-between items-end border-b border-bloom-dark/10 pb-8">
          <div className="reveal-up active">
            <h2 className="font-serif text-fluid-h2 text-bloom-dark">
              L'Ecosystème <br />
              <span className="italic text-bloom-sage">Modulaire.</span>
            </h2>
          </div>
          <div className="reveal-up delay-100 max-w-md mt-8 md:mt-0 text-right active">
            <p className="font-sans text-bloom-dark/70 text-sm leading-relaxed">
              Une architecture où chaque module s'imbrique pour créer l'expérience de tournoi parfaite.
              Simple pour vous, inoubliable pour eux.
            </p>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
          {/* Block 1: The Engine (Large) */}
          <div className="md:col-span-8 md:row-span-2 bento-card rounded-3xl p-8 relative overflow-hidden group reveal-up active">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="p-2 bg-bloom-dark text-bloom-bg rounded-lg">
                    <Trophy className="h-6 w-6" />
                  </span>
                  <span className="font-sans text-xs uppercase tracking-widest text-bloom-dark/60">
                    Core Feature
                  </span>
                </div>
                <h3 className="font-serif text-4xl text-bloom-dark mb-4">Moteur de Brackets</h3>
                <p className="font-sans text-bloom-dark/70 max-w-md leading-relaxed">
                  Créez des arbres de tournois complexes en quelques clics. Double élimination, phases de groupes,
                  ou formats suisses. Le tout avec un drag & drop fluide comme l'eau.
                </p>
              </div>
              <Button
                variant="link"
                className="w-fit mt-8 border-b border-bloom-dark text-sm uppercase tracking-widest pb-1 hover:text-bloom-accent hover:border-bloom-accent transition-colors rounded-none px-0"
              >
                Explorer le Moteur
              </Button>
            </div>
          </div>

          {/* Block 2: Real-time (Tall) */}
          <div className="md:col-span-4 md:row-span-2 bento-card bg-bloom-dark text-bloom-bg rounded-3xl p-8 relative overflow-hidden group reveal-up delay-100 active">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
              <Zap className="h-24 w-24" />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <h3 className="font-serif text-3xl italic mb-4">Mode Broadcast</h3>
              <p className="font-sans text-sm text-bloom-bg/60 mb-8 leading-relaxed">
                Des overlays dynamiques connectés à votre tournoi. Mise à jour des scores en temps réel
                sur votre stream.
              </p>
              <div className="mt-auto">
                <div className="bg-bloom-accent/20 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <div>
                      <p className="font-sans text-[0.6rem] uppercase tracking-widest opacity-70">
                        Statut
                      </p>
                      <p className="font-serif italic text-lg leading-none">Live</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Block 3: Payments */}
          <div className="md:col-span-4 bento-card rounded-3xl p-6 flex flex-col justify-between group reveal-up delay-200 active">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-serif text-2xl text-bloom-dark">Billetterie</h3>
              <div className="w-10 h-10 rounded-full bg-bloom-accent/10 text-bloom-accent flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <p className="font-sans text-xs text-bloom-dark/60 mb-4">
              Vendez vos places et gérez le cashprize. 0% de commission sur les gains.
            </p>
            <div className="w-full bg-white rounded-lg p-3 shadow-sm border border-bloom-dark/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">
                $
              </div>
              <div className="flex-1">
                <div className="h-2 w-2/3 bg-gray-100 rounded mb-1"></div>
                <div className="h-1.5 w-1/3 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>

          {/* Block 4: Community */}
          <div className="md:col-span-4 bento-card rounded-3xl p-6 flex flex-col justify-between group reveal-up delay-300 active">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-serif text-2xl text-bloom-dark">Communauté</h3>
              <div className="w-10 h-10 rounded-full bg-bloom-sage/20 text-bloom-sage flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="font-sans text-xs text-bloom-dark/60 mb-4">
              Synchronisation Discord native. Rôles auto-attribués et salons de matchs privés.
            </p>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-bloom-sage" />
              <span className="font-sans text-xs text-bloom-dark/70">Protection anti-triche intégrée</span>
            </div>
          </div>

          {/* Block 5: Analytics */}
          <div className="md:col-span-4 bento-card rounded-3xl p-6 relative overflow-hidden group reveal-up delay-400 active">
            <div className="absolute inset-0 bg-gradient-to-r from-bloom-sage/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <h3 className="font-serif text-2xl text-bloom-dark mb-2">Analytics</h3>
              <p className="font-sans text-xs text-bloom-dark/60 mb-4">
                Comprenez votre audience. Données détaillées sur les participants.
              </p>
            </div>
            <div className="mt-4 flex items-end gap-1 h-12">
              <div className="w-1/6 bg-bloom-dark/20 h-[40%] rounded-t group-hover:h-[60%] transition-all duration-300"></div>
              <div className="w-1/6 bg-bloom-dark/20 h-[70%] rounded-t group-hover:h-[80%] transition-all duration-300 delay-75"></div>
              <div className="w-1/6 bg-bloom-accent h-[50%] rounded-t group-hover:h-[90%] transition-all duration-300 delay-100"></div>
              <div className="w-1/6 bg-bloom-dark/20 h-[30%] rounded-t group-hover:h-[50%] transition-all duration-300 delay-150"></div>
              <div className="w-1/6 bg-bloom-dark/20 h-[60%] rounded-t group-hover:h-[70%] transition-all duration-300 delay-200"></div>
              <div className="w-1/6 bg-bloom-dark/20 h-[45%] rounded-t group-hover:h-[55%] transition-all duration-300 delay-250"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-bloom-dark text-bloom-bg">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-5xl md:text-6xl italic mb-6 reveal-up active">
            Prêt à fleurir?
          </h2>
          <p className="font-sans text-lg text-bloom-bg/70 mb-8 reveal-up delay-100 active">
            Rejoignez les organisateurs qui font confiance à Bloom pour leurs compétitions.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-bloom-accent text-white px-10 py-6 rounded-none font-sans text-sm uppercase tracking-[0.2em] hover:bg-white hover:text-bloom-dark transition-colors duration-300 reveal-up delay-200 active"
          >
            <Link href="/register">Essai Gratuit 14 Jours</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bloom-dark text-bloom-bg pt-20 pb-6 px-6 border-t border-bloom-bg/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
              <h2 className="font-serif text-5xl md:text-8xl italic mb-8">Bloom.</h2>
              <p className="font-sans text-sm text-gray-400 max-w-sm leading-relaxed">
                Le système d'exploitation des compétitions modernes. Nous aidons les communautés à grandir,
                un match à la fois.
              </p>
            </div>
            <div>
              <h4 className="font-sans text-xs uppercase tracking-widest mb-6 text-bloom-sage">
                Produit
              </h4>
              <ul className="space-y-4 font-serif text-xl text-gray-300">
                <li>
                  <Link href="#features" className="hover:text-bloom-accent transition-colors">
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link href="/tournaments" className="hover:text-bloom-accent transition-colors">
                    Tournois
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-bloom-accent transition-colors">
                    Tarifs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans text-xs uppercase tracking-widest mb-6 text-bloom-sage">
                Légal
              </h4>
              <ul className="space-y-2 font-sans text-sm text-gray-500">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Conditions Générales
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Confidentialité
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Mentions Légales
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-end border-t border-gray-800 pt-6">
            <div className="font-sans text-[10px] text-gray-600 uppercase tracking-widest">
              © 2025 Bloom SaaS Technologies. Paris, France.
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
