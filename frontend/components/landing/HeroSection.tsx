'use client'

import Link from 'next/link'
import { PlayCircle } from 'lucide-react'

export function HeroSection() {
  return (
    <header className="relative min-h-screen flex flex-col justify-center items-center px-4 pt-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Placeholder for background image */}
        <div className="w-full h-full bg-gradient-to-b from-bloom-dark/5 to-transparent opacity-40" />
      </div>

      <div className="z-10 text-center flex flex-col items-center w-full max-w-7xl">
        <div className="flex items-center gap-4 mb-6 reveal-up delay-100 active">
          <span className="h-[1px] w-12 bg-bloom-dark" />
          <p className="font-sans text-xs md:text-sm tracking-[0.4em] uppercase text-bloom-green">
            SaaS pour Organisateurs
          </p>
          <span className="h-[1px] w-12 bg-bloom-dark" />
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
          Concevez des tournois inoubliables. De la graine de l'idée à la floraison de la finale, Bloom
          vous offre les outils pour cultiver l'excellence.
        </p>

        {/* Dashboard Image Container */}
        <div
          className="relative w-full aspect-[16/10] md:aspect-[21/9] my-12 reveal-up delay-300 group cursor-pointer perspective-1000 active"
          id="hero-image-container"
        >
          {/* Decorative elements behind */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-bloom-accent/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-bloom-sage/20 rounded-full blur-3xl animate-float-delayed" />

          {/* Dashboard Card */}
          <div className="relative w-full h-full glass-card rounded-xl overflow-hidden shadow-2xl transform transition-transform duration-700 hover:rotate-x-2 border border-bloom-dark/10">
            {/* Browser/App Bar */}
            <div className="h-10 bg-[#F4F1EA] border-b border-bloom-dark/5 flex items-center px-4 gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#E5786D]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#E5BC6D]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#6DE5A3]" />
              <div className="ml-6 w-1/3 h-5 bg-bloom-dark/5 rounded-full" />
            </div>

            {/* Image Content - Placeholder */}
            <div className="w-full h-full bg-gradient-to-br from-bloom-bg via-bloom-sage/10 to-bloom-accent/5 flex items-center justify-center">
              <div className="text-bloom-dark/20 text-sm font-sans tracking-widest">
                DASHBOARD INTERFACE
              </div>
            </div>

            {/* Floating Status Badge */}
            <div className="absolute bottom-6 right-6 bg-bloom-dark text-bloom-bg p-4 rounded-lg shadow-xl animate-float hidden md:flex items-center gap-3 z-20">
              <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
              </div>
              <div>
                <p className="font-sans text-[0.6rem] uppercase tracking-widest opacity-70">Statut</p>
                <p className="font-serif italic text-lg leading-none">Tournoi Actif</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center mt-4 reveal-up delay-500 active">
          <Link
            href="/register"
            className="bg-bloom-dark text-bloom-bg px-10 py-4 rounded-none font-sans text-sm uppercase tracking-[0.2em] hover:bg-bloom-accent transition-colors duration-300"
          >
            Commencer Gratuitement
          </Link>
          <button className="flex items-center gap-2 px-8 py-4 font-sans text-sm uppercase tracking-[0.2em] text-bloom-dark hover:opacity-70 transition-opacity">
            <PlayCircle className="h-5 w-5" />
            Voir la démo
          </button>
        </div>
      </div>
    </header>
  )
}
