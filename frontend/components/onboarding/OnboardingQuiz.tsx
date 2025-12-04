'use client'

import { useState } from 'react'
import { Check, Sparkles, Gamepad2, Target, Zap } from 'lucide-react'

const GAMES = [
  { id: 'cs2', name: 'Counter-Strike 2', icon: '🎯', color: 'from-orange-500 to-yellow-600' },
  { id: 'valorant', name: 'Valorant', icon: '⚡', color: 'from-red-500 to-pink-600' },
  { id: 'league', name: 'League of Legends', icon: '⚔️', color: 'from-blue-500 to-cyan-600' },
  { id: 'rocket', name: 'Rocket League', icon: '🚀', color: 'from-blue-600 to-purple-600' },
  { id: 'fortnite', name: 'Fortnite', icon: '🌟', color: 'from-purple-600 to-pink-600' },
  { id: 'dota', name: 'Dota 2', icon: '🔥', color: 'from-red-600 to-orange-600' },
]

const SKILL_LEVELS = [
  { id: 'casual', name: 'Casual', description: 'Je joue pour le fun', icon: Gamepad2 },
  { id: 'competitive', name: 'Compétitif', description: 'Je vise la victoire', icon: Target },
  { id: 'pro', name: 'Pro/Semi-Pro', description: 'C\'est mon métier', icon: Zap },
]

interface OnboardingQuizProps {
  onComplete: (data: { game: string; skillLevel: string; notifications: boolean }) => void
  onSkip: () => void
}

export function OnboardingQuiz({ onComplete, onSkip }: OnboardingQuizProps) {
  const [step, setStep] = useState(1)
  const [selectedGame, setSelectedGame] = useState<string>('')
  const [selectedSkill, setSelectedSkill] = useState<string>('')
  const [notifications, setNotifications] = useState(true)

  const handleSubmit = () => {
    onComplete({
      game: selectedGame,
      skillLevel: selectedSkill,
      notifications,
    })
  }

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bloom-dark/60 backdrop-blur-sm" />

      {/* Quiz Container */}
      <div className="relative z-10 w-full max-w-3xl mx-4">
        {/* Glow Effect */}
        <div className="absolute -inset-8 bg-gradient-to-r from-bloom-accent to-bloom-sage opacity-20 blur-3xl rounded-full animate-pulse" />

        {/* Card */}
        <div className="relative bg-bloom-bg border-2 border-bloom-dark/10 rounded-2xl p-8 md:p-12 shadow-2xl">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-bloom-dark/5 rounded-t-2xl overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-bloom-accent to-bloom-sage transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-bloom-accent animate-pulse" />
              <span className="font-sans text-xs uppercase tracking-[0.3em] text-bloom-dark/50">
                Étape {step}/{totalSteps}
              </span>
            </div>
          </div>

          {/* Step 1: Game Selection */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-in">
              <h2 className="font-serif text-4xl md:text-5xl italic text-bloom-dark text-center">
                Quel est ton jeu principal ?
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                {GAMES.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => {
                      setSelectedGame(game.id)
                      setTimeout(() => setStep(2), 300)
                    }}
                    className={`group relative p-6 rounded-xl border-2 transition-all duration-300 ${
                      selectedGame === game.id
                        ? 'border-bloom-accent scale-105 shadow-xl'
                        : 'border-bloom-dark/10 hover:border-bloom-dark/30 hover:scale-102'
                    }`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-10 rounded-xl group-hover:opacity-20 transition-opacity`}
                    />
                    <div className="relative text-center">
                      <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                        {game.icon}
                      </div>
                      <p className="font-sans text-sm font-medium">{game.name}</p>
                    </div>

                    {selectedGame === game.id && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 bg-bloom-accent rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Skill Level */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-in">
              <h2 className="font-serif text-4xl md:text-5xl italic text-bloom-dark text-center">
                Ton niveau de jeu ?
              </h2>

              <div className="space-y-4 mt-8 max-w-xl mx-auto">
                {SKILL_LEVELS.map((level) => {
                  const Icon = level.icon
                  return (
                    <button
                      key={level.id}
                      onClick={() => {
                        setSelectedSkill(level.id)
                        setTimeout(() => setStep(3), 300)
                      }}
                      className={`w-full flex items-center gap-6 p-6 rounded-xl border-2 transition-all duration-300 ${
                        selectedSkill === level.id
                          ? 'border-bloom-accent bg-bloom-accent/5 scale-102 shadow-lg'
                          : 'border-bloom-dark/10 hover:border-bloom-dark/30 hover:scale-101'
                      }`}
                    >
                      <div className={`p-4 rounded-lg ${
                        selectedSkill === level.id
                          ? 'bg-bloom-accent text-white'
                          : 'bg-bloom-dark/5 text-bloom-dark'
                      } transition-colors`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-serif text-2xl italic mb-1">{level.name}</h3>
                        <p className="font-sans text-sm text-bloom-dark/60">{level.description}</p>
                      </div>
                      {selectedSkill === level.id && (
                        <Check className="h-6 w-6 text-bloom-accent" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 3: Notifications */}
          {step === 3 && (
            <div className="space-y-8 animate-fade-in">
              <h2 className="font-serif text-4xl md:text-5xl italic text-bloom-dark text-center">
                Rester informé ?
              </h2>

              <p className="font-sans text-lg text-bloom-dark/60 text-center max-w-2xl mx-auto">
                Reçois des notifications pour ne jamais rater un tournoi qui te correspond.
              </p>

              <div className="space-y-4 mt-8 max-w-xl mx-auto">
                <button
                  onClick={() => setNotifications(true)}
                  className={`w-full flex items-center justify-between p-6 rounded-xl border-2 transition-all duration-300 ${
                    notifications
                      ? 'border-bloom-accent bg-bloom-accent/5 scale-102 shadow-lg'
                      : 'border-bloom-dark/10 hover:border-bloom-dark/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      notifications ? 'bg-bloom-accent' : 'bg-bloom-dark/5'
                    }`}>
                      <Sparkles className={`h-5 w-5 ${
                        notifications ? 'text-white' : 'text-bloom-dark'
                      }`} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-serif text-xl italic">Oui, me notifier</h3>
                      <p className="font-sans text-sm text-bloom-dark/60">Recommandé</p>
                    </div>
                  </div>
                  {notifications && <Check className="h-6 w-6 text-bloom-accent" />}
                </button>

                <button
                  onClick={() => setNotifications(false)}
                  className={`w-full flex items-center justify-between p-6 rounded-xl border-2 transition-all duration-300 ${
                    !notifications
                      ? 'border-bloom-accent bg-bloom-accent/5 scale-102 shadow-lg'
                      : 'border-bloom-dark/10 hover:border-bloom-dark/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      !notifications ? 'bg-bloom-accent' : 'bg-bloom-dark/5'
                    }`}>
                      <span className="text-xl">{!notifications ? '🔕' : '🔔'}</span>
                    </div>
                    <div className="text-left">
                      <h3 className="font-serif text-xl italic">Non merci</h3>
                      <p className="font-sans text-sm text-bloom-dark/60">Je vérifierai moi-même</p>
                    </div>
                  </div>
                  {!notifications && <Check className="h-6 w-6 text-bloom-accent" />}
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  onClick={onSkip}
                  className="px-6 py-3 font-sans text-sm text-bloom-dark/60 hover:text-bloom-dark transition-colors"
                >
                  Passer
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-bloom-dark text-bloom-bg px-10 py-4 rounded-none font-sans text-sm uppercase tracking-[0.2em] hover:bg-bloom-accent transition-all duration-300 hover:scale-105"
                >
                  Terminer
                </button>
              </div>
            </div>
          )}

          {/* Navigation (Steps 1-2) */}
          {step < 3 && (
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-bloom-dark/5">
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 font-sans text-sm text-bloom-dark/60 hover:text-bloom-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={step === 1}
              >
                Précédent
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index + 1 === step
                        ? 'w-8 bg-bloom-accent'
                        : index + 1 < step
                        ? 'w-1.5 bg-bloom-sage'
                        : 'w-1.5 bg-bloom-dark/10'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={onSkip}
                className="px-4 py-2 font-sans text-sm text-bloom-dark/40 hover:text-bloom-dark/70 transition-colors"
              >
                Passer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
