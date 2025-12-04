'use client'

import { GitBranch, Radio, CreditCard, Users, BarChart3 } from 'lucide-react'

export function FeaturesSection() {
  return (
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
            Une architecture "bento" où chaque module s'imbrique pour créer l'expérience de tournoi
            parfaite.
            <br />
            Simple pour vous, inoubliable pour eux.
          </p>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
        {/* Block 1: The Engine (Large) */}
        <div className="md:col-span-8 md:row-span-2 bento-card rounded-3xl p-8 relative overflow-hidden group reveal-up active">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="p-2 bg-bloom-dark text-bloom-bg rounded-lg">
                  <GitBranch className="h-6 w-6" />
                </span>
                <span className="font-sans text-xs uppercase tracking-widest text-bloom-dark/60">
                  Core Feature
                </span>
              </div>
              <h3 className="font-serif text-4xl text-bloom-dark mb-4">Moteur de Brackets</h3>
              <p className="font-sans text-bloom-dark/70 max-w-md leading-relaxed">
                Créez des arbres de tournois complexes en quelques clics. Double élimination, phases de
                groupes, ou formats suisses. Le tout avec un drag & drop fluide comme l'eau.
              </p>
            </div>
            <button className="w-fit mt-8 border-b border-bloom-dark text-sm uppercase tracking-widest pb-1 hover:text-bloom-accent hover:border-bloom-accent transition-colors">
              Explorer le Moteur
            </button>
          </div>
          {/* Visual Asset */}
          <div className="absolute right-0 bottom-0 w-1/2 h-3/4 translate-x-12 translate-y-8 group-hover:translate-x-8 group-hover:translate-y-4 transition-transform duration-700 shadow-2xl rounded-tl-2xl overflow-hidden border border-bloom-dark/5">
            <div className="w-full h-full bg-gradient-to-br from-bloom-sage/10 to-bloom-accent/5" />
          </div>
        </div>

        {/* Block 2: Broadcast (Tall) */}
        <div className="md:col-span-4 md:row-span-2 bento-card bg-bloom-dark text-bloom-bg rounded-3xl p-8 relative overflow-hidden group reveal-up delay-100 active">
          <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
            <Radio className="h-24 w-24" />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <h3 className="font-serif text-3xl italic mb-4">Mode Broadcast</h3>
            <p className="font-sans text-sm text-bloom-bg/60 mb-8 leading-relaxed">
              Des overlays dynamiques connectés à votre tournoi. Mise à jour des scores en temps réel sur
              votre stream Twitch ou YouTube.
            </p>
            {/* Phone/Mobile Mockup */}
            <div className="mt-auto mx-auto w-48 h-80 bg-bloom-bg rounded-[2rem] border-4 border-bloom-sage/30 overflow-hidden shadow-2xl transform group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-gradient-to-br from-bloom-bg via-bloom-sage/10 to-bloom-accent/5 flex items-center justify-center">
                <div className="text-bloom-dark/20 text-xs font-sans tracking-widest rotate-90">
                  MOBILE APP
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Block 3: Payments (Medium) */}
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
              <div className="h-2 w-2/3 bg-gray-100 rounded mb-1" />
              <div className="h-1.5 w-1/3 bg-gray-100 rounded" />
            </div>
          </div>
        </div>

        {/* Block 4: Community (Medium) */}
        <div className="md:col-span-4 bento-card rounded-3xl p-6 flex flex-col justify-between group reveal-up delay-300 active">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-serif text-2xl text-bloom-dark">Communauté</h3>
            <div className="w-10 h-10 rounded-full bg-[#5865F2]/10 text-[#5865F2] flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="font-sans text-xs text-bloom-dark/60 mb-4">
            Synchronisation Discord native. Rôles auto-attribués et salons de matchs privés.
          </p>
          <div className="flex -space-x-2 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-bloom-sage/30"
              />
            ))}
            <div className="h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
              +42
            </div>
          </div>
        </div>

        {/* Block 5: Analytics (Wide) */}
        <div className="md:col-span-4 bento-card rounded-3xl p-6 relative overflow-hidden group reveal-up delay-400 active">
          <div className="absolute inset-0 bg-gradient-to-r from-bloom-sage/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <h3 className="font-serif text-2xl text-bloom-dark mb-2">Analytics</h3>
            <p className="font-sans text-xs text-bloom-dark/60">
              Comprenez votre audience. Données détaillées sur les participants.
            </p>
          </div>
          <div className="mt-4 flex items-end gap-1 h-12">
            <div className="w-1/6 bg-bloom-dark/20 h-[40%] rounded-t group-hover:h-[60%] transition-all duration-300" />
            <div className="w-1/6 bg-bloom-dark/20 h-[70%] rounded-t group-hover:h-[80%] transition-all duration-300 delay-75" />
            <div className="w-1/6 bg-bloom-accent h-[50%] rounded-t group-hover:h-[90%] transition-all duration-300 delay-100" />
            <div className="w-1/6 bg-bloom-dark/20 h-[30%] rounded-t group-hover:h-[50%] transition-all duration-300 delay-150" />
            <div className="w-1/6 bg-bloom-dark/20 h-[60%] rounded-t group-hover:h-[70%] transition-all duration-300 delay-200" />
            <div className="w-1/6 bg-bloom-dark/20 h-[45%] rounded-t group-hover:h-[55%] transition-all duration-300 delay-250" />
          </div>
        </div>
      </div>
    </section>
  )
}
