'use client'

import { Check } from 'lucide-react'

export function PricingSection() {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto" id="pricing">
      <div className="text-center mb-20 reveal-up active">
        <span className="font-sans text-xs tracking-[0.3em] uppercase text-bloom-sage mb-4 block">
          Investissement
        </span>
        <h2 className="font-serif text-5xl md:text-6xl text-bloom-dark">Choisissez votre Plan</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Plan 1 - Graine */}
        <div className="p-8 border border-bloom-dark/10 rounded-2xl hover:border-bloom-dark/30 transition-colors reveal-up group active">
          <h3 className="font-serif text-3xl italic mb-2 text-bloom-dark/50">Graine</h3>
          <div className="mb-6">
            <span className="text-4xl font-bold font-sans">0€</span>{' '}
            <span className="text-xs text-gray-400">/tournoi</span>
          </div>
          <p className="text-sm text-gray-500 mb-8 h-12">
            Pour les petits événements communautaires et les tests.
          </p>
          <ul className="space-y-3 mb-8 text-sm font-sans text-gray-600">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-bloom-green" />
              Jusqu'à 16 Joueurs
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-bloom-green" />
              Brackets Simples
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-bloom-green" />
              Page d'inscription basique
            </li>
          </ul>
          <button className="w-full py-3 border border-bloom-dark text-bloom-dark font-sans text-xs uppercase tracking-widest hover:bg-bloom-dark hover:text-bloom-bg transition-colors rounded">
            Démarrer
          </button>
        </div>

        {/* Plan 2 - Floraison (Featured) */}
        <div className="p-8 bg-bloom-dark text-bloom-bg rounded-2xl shadow-2xl scale-105 relative reveal-up delay-100 active">
          <div className="absolute top-0 right-0 p-4">
            <span className="bg-bloom-accent text-xs font-bold px-2 py-1 rounded text-white">
              POPULAIRE
            </span>
          </div>
          <h3 className="font-serif text-4xl italic mb-2 text-bloom-sage">Floraison</h3>
          <div className="mb-6">
            <span className="text-5xl font-bold font-sans">29€</span>{' '}
            <span className="text-xs text-bloom-bg/50">/mois</span>
          </div>
          <p className="text-sm text-bloom-bg/70 mb-8 h-12">
            L'outil complet pour les organisateurs réguliers.
          </p>
          <ul className="space-y-3 mb-8 text-sm font-sans text-gray-300">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-bloom-accent" />
              Joueurs Illimités
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-bloom-accent" />
              Tous les formats de Brackets
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-bloom-accent" />
              0% Frais de transaction
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-bloom-accent" />
              Export API Broadcast
            </li>
          </ul>
          <button className="w-full py-4 bg-bloom-accent text-white font-sans text-xs uppercase tracking-widest hover:bg-white hover:text-bloom-dark transition-colors rounded shadow-lg font-bold">
            Essai 14 Jours
          </button>
        </div>

        {/* Plan 3 - Forêt */}
        <div className="p-8 border border-bloom-dark/10 rounded-2xl hover:border-bloom-dark/30 transition-colors reveal-up delay-200 active">
          <h3 className="font-serif text-3xl italic mb-2 text-bloom-dark/50">Forêt</h3>
          <div className="mb-6">
            <span className="text-4xl font-bold font-sans">Sur Devis</span>
          </div>
          <p className="text-sm text-gray-500 mb-8 h-12">
            Pour les ligues professionnelles et fédérations.
          </p>
          <ul className="space-y-3 mb-8 text-sm font-sans text-gray-600">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-bloom-green" />
              Marque blanche totale
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-bloom-green" />
              Serveurs Dédiés
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-bloom-green" />
              Support 24/7 prioritaire
            </li>
          </ul>
          <button className="w-full py-3 border border-bloom-dark text-bloom-dark font-sans text-xs uppercase tracking-widest hover:bg-bloom-dark hover:text-bloom-bg transition-colors rounded">
            Contacter
          </button>
        </div>
      </div>
    </section>
  )
}
