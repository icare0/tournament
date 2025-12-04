'use client'

import { useState } from 'react'
import { useOnboarding } from '@/hooks/useOnboarding'
import { OnboardingBubble } from './OnboardingBubble'
import { OnboardingQuiz } from './OnboardingQuiz'

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Bienvenue sur Bloom',
    description: 'La plateforme premium pour organiser et participer à des tournois esports d\'exception. Laissez-nous vous guider.',
    position: 'center' as const,
  },
  {
    id: 'discover',
    title: 'Découvrez les Tournois',
    description: 'Explorez les tournois publics, inscrivez-vous et montez dans les classements. Votre parcours vers la gloire commence ici.',
    action: 'Explorer',
    position: 'center' as const,
  },
  {
    id: 'quiz',
    title: 'Personnalisez votre Expérience',
    description: 'Quelques questions rapides pour vous recommander les meilleurs tournois.',
    position: 'center' as const,
  },
  {
    id: 'complete',
    title: 'Tout est Prêt !',
    description: 'Vous êtes maintenant prêt à dominer. Bonne chance dans vos tournois !',
    action: 'Commencer',
    position: 'center' as const,
  },
]

interface OnboardingFlowProps {
  onComplete?: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [showQuiz, setShowQuiz] = useState(false)
  const {
    currentStep,
    stepIndex,
    totalSteps,
    isActive,
    start,
    next,
    prev,
    skip,
    complete,
    progress,
  } = useOnboarding({
    steps: ONBOARDING_STEPS,
    onComplete,
    storageKey: 'bloom-onboarding-v1',
  })

  // Auto-start onboarding after mount (or you can trigger it manually)
  // useEffect(() => {
  //   const timer = setTimeout(() => start(), 1000)
  //   return () => clearTimeout(timer)
  // }, [start])

  const handleNext = () => {
    // Show quiz on step 3
    if (stepIndex === 2) {
      setShowQuiz(true)
    } else {
      next()
    }
  }

  const handleQuizComplete = (data: any) => {
    setShowQuiz(false)
    // Save user preferences
    localStorage.setItem('user-preferences', JSON.stringify(data))
    next()
  }

  if (!isActive) {
    return null
  }

  if (showQuiz) {
    return (
      <OnboardingQuiz
        onComplete={handleQuizComplete}
        onSkip={() => {
          setShowQuiz(false)
          next()
        }}
      />
    )
  }

  return (
    <OnboardingBubble
      title={currentStep.title}
      description={currentStep.description}
      action={currentStep.action}
      position={currentStep.position}
      currentStep={stepIndex}
      totalSteps={totalSteps}
      progress={progress}
      onNext={handleNext}
      onPrev={prev}
      onSkip={skip}
    />
  )
}

// Export function to manually start onboarding
export { useOnboarding }
