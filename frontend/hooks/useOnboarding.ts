'use client'

import { useState, useEffect } from 'react'

export interface OnboardingStep {
  id: string
  title: string
  description: string
  action?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  highlight?: string // Selector for element to highlight
}

interface UseOnboardingOptions {
  steps: OnboardingStep[]
  onComplete?: () => void
  storageKey?: string
}

export function useOnboarding({ steps, onComplete, storageKey = 'onboarding-completed' }: UseOnboardingOptions) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    // Check if onboarding was already completed
    const completed = localStorage.getItem(storageKey)
    if (completed === 'true') {
      setIsCompleted(true)
      setIsActive(false)
    }
  }, [storageKey])

  const start = () => {
    setIsActive(true)
    setCurrentStep(0)
  }

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      complete()
    }
  }

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skip = () => {
    setIsActive(false)
    localStorage.setItem(storageKey, 'skipped')
  }

  const complete = () => {
    setIsActive(false)
    setIsCompleted(true)
    localStorage.setItem(storageKey, 'true')
    onComplete?.()
  }

  const reset = () => {
    localStorage.removeItem(storageKey)
    setIsCompleted(false)
    setCurrentStep(0)
    setIsActive(true)
  }

  return {
    currentStep: steps[currentStep],
    stepIndex: currentStep,
    totalSteps: steps.length,
    isActive,
    isCompleted,
    start,
    next,
    prev,
    skip,
    complete,
    reset,
    progress: ((currentStep + 1) / steps.length) * 100,
  }
}
