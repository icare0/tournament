'use client'

import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

interface OnboardingBubbleProps {
  title: string
  description: string
  action?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  currentStep: number
  totalSteps: number
  progress: number
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
}

export function OnboardingBubble({
  title,
  description,
  action,
  position = 'center',
  currentStep,
  totalSteps,
  progress,
  onNext,
  onPrev,
  onSkip,
}: OnboardingBubbleProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [currentStep])

  const positionClasses = {
    top: 'top-20 left-1/2 -translate-x-1/2',
    bottom: 'bottom-20 left-1/2 -translate-x-1/2',
    left: 'left-8 top-1/2 -translate-y-1/2',
    right: 'right-8 top-1/2 -translate-y-1/2',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-bloom-dark/60 backdrop-blur-sm z-50 transition-opacity duration-500" />

      {/* Bubble Container */}
      <div
        className={`fixed ${positionClasses[position]} z-50 transition-all duration-500 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Main Bubble Card */}
        <div className="relative w-full max-w-md">
          {/* Glow Effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-bloom-accent to-bloom-sage opacity-20 blur-2xl rounded-full animate-pulse" />

          {/* Card */}
          <div className="relative bg-bloom-bg border-2 border-bloom-dark/10 rounded-2xl p-8 shadow-2xl">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-bloom-dark/5 rounded-t-2xl overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-bloom-accent to-bloom-sage transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Close Button */}
            <button
              onClick={onSkip}
              className="absolute top-4 right-4 p-2 hover:bg-bloom-dark/5 rounded-lg transition-colors group"
            >
              <X className="h-4 w-4 text-bloom-dark/40 group-hover:text-bloom-dark/70" />
            </button>

            {/* Icon */}
            <div className="mb-6 inline-flex items-center gap-2">
              <div className="relative">
                <Sparkles className="h-6 w-6 text-bloom-accent" />
                <Sparkles className="h-6 w-6 text-bloom-accent absolute inset-0 animate-ping opacity-50" />
              </div>
              <span className="font-sans text-xs uppercase tracking-[0.3em] text-bloom-dark/50">
                Étape {currentStep + 1}/{totalSteps}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-serif text-3xl italic text-bloom-dark mb-4">
              {title}
            </h3>

            {/* Description */}
            <p className="font-sans text-base text-bloom-dark/70 leading-relaxed mb-8">
              {description}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between gap-4">
              {/* Previous Button */}
              {currentStep > 0 && (
                <button
                  onClick={onPrev}
                  className="flex items-center gap-2 px-4 py-2 font-sans text-sm text-bloom-dark/60 hover:text-bloom-dark transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Précédent
                </button>
              )}

              {/* Skip Button */}
              <button
                onClick={onSkip}
                className="px-4 py-2 font-sans text-sm text-bloom-dark/40 hover:text-bloom-dark/70 transition-colors"
              >
                Passer
              </button>

              {/* Next Button */}
              <button
                onClick={onNext}
                className="flex items-center gap-2 bg-bloom-dark text-bloom-bg px-6 py-3 rounded-none font-sans text-sm uppercase tracking-[0.2em] hover:bg-bloom-accent transition-all duration-300 hover:scale-105 ml-auto"
              >
                {action || (currentStep === totalSteps - 1 ? 'Terminer' : 'Suivant')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-bloom-dark/5">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'w-8 bg-bloom-accent'
                      : index < currentStep
                      ? 'w-1.5 bg-bloom-sage'
                      : 'w-1.5 bg-bloom-dark/10'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-bloom-accent rounded-full opacity-60 animate-bounce" />
          <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-bloom-sage rounded-full opacity-60 animate-bounce" style={{ animationDelay: '150ms' }} />
        </div>
      </div>
    </>
  )
}
