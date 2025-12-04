'use client'

import { useEffect } from 'react'

/**
 * Hook to handle scroll reveal animations
 * Adds 'active' class to elements with 'reveal-up' class when they enter viewport
 */
export function useScrollReveal() {
  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
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

    // Observe all elements with reveal-up class
    const revealElements = document.querySelectorAll('.reveal-up')
    revealElements.forEach((el) => {
      observer.observe(el)
    })

    // Cleanup
    return () => {
      observer.disconnect()
    }
  }, [])
}
