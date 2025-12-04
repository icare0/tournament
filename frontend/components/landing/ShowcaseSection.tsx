'use client'

import { Layers, ChevronDown, Settings } from 'lucide-react'

export function ShowcaseSection() {
  return (
    <section className="py-24 bg-bloom-dark text-bloom-bg overflow-hidden relative" id="showcase">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-bloom-green to-bloom-dark" />
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="reveal-up active">
            <Layers className="h-12 w-12 text-bloom-sage mb-6" />
            <h2 className="font-serif text-5xl mb-6">
              Contrôle Total.
              <br />
              Sans l'Effort.
            </h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <span className="w-6 h-6 rounded-full border border-bloom-sage flex items-center justify-center text-xs text-bloom-sage mt-1">
                  1
                </span>
                <div>
                  <h4 className="font-serif text-xl italic text-bloom-bg">Drag & Drop Intuitif</h4>
                  <p className="font-sans text-sm text-bloom-bg/60 mt-1">
                    Modifiez vos seeds et vos matchs à la volée, même en plein direct.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-6 h-6 rounded-full border border-bloom-sage flex items-center justify-center text-xs text-bloom-sage mt-1">
                  2
                </span>
                <div>
                  <h4 className="font-serif text-xl italic text-bloom-bg">
                    Pages d'Inscription "Whitelabel"
                  </h4>
                  <p className="font-sans text-sm text-bloom-bg/60 mt-1">
                    Une page d'atterrissage générée automatiquement, à votre image, sans coder.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-6 h-6 rounded-full border border-bloom-sage flex items-center justify-center text-xs text-bloom-sage mt-1">
                  3
                </span>
                <div>
                  <h4 className="font-serif text-xl italic text-bloom-bg">API Ouverte</h4>
                  <p className="font-sans text-sm text-bloom-bg/60 mt-1">
                    Connectez Bloom à vos outils de broadcast (OBS, vMix) pour des overlays dynamiques.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="relative reveal-up delay-200 active">
            {/* Glassmorphism Card for "Tournament Settings" */}
            <div className="glass-card bg-bloom-bg/10 p-6 rounded-xl border border-bloom-bg/20 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-8 border-b border-bloom-bg/10 pb-4">
                <span className="font-serif italic text-xl">Paramètres du Tournoi</span>
                <Settings className="h-5 w-5 text-bloom-bg/50" />
              </div>
              {/* Fake Form Elements */}
              <div className="space-y-4">
                <div>
                  <label className="block font-sans text-xs uppercase tracking-widest text-bloom-sage mb-2">
                    Nom de l'événement
                  </label>
                  <div className="w-full bg-bloom-dark/50 border border-bloom-bg/10 rounded h-10 px-3 flex items-center text-sm font-sans">
                    Bloom Winter Cup 2025
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-sans text-xs uppercase tracking-widest text-bloom-sage mb-2">
                      Format
                    </label>
                    <div className="w-full bg-bloom-dark/50 border border-bloom-bg/10 rounded h-10 px-3 flex items-center justify-between text-sm font-sans">
                      Double Élimination <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-sans text-xs uppercase tracking-widest text-bloom-sage mb-2">
                      Participants
                    </label>
                    <div className="w-full bg-bloom-dark/50 border border-bloom-bg/10 rounded h-10 px-3 flex items-center text-sm font-sans">
                      64 Max
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-10 h-6 rounded-full bg-bloom-accent relative transition-colors">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                    <span className="font-sans text-sm group-hover:text-white transition-colors">
                      Activer les inscriptions publiques
                    </span>
                  </label>
                </div>
                <button className="w-full bg-bloom-bg text-bloom-dark py-3 rounded mt-4 font-sans text-xs uppercase font-bold tracking-widest hover:bg-bloom-sage transition-colors">
                  Sauvegarder
                </button>
              </div>
            </div>
            {/* Floating Notification Element */}
            <div className="absolute -right-8 top-10 bg-bloom-accent text-white p-4 rounded-lg shadow-xl animate-float-delayed w-48 hidden md:block">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👥</span>
                <div className="text-xs">
                  <p className="font-bold">+12 Inscriptions</p>
                  <p className="opacity-80">à l'instant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
