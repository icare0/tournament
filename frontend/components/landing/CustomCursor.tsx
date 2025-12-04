'use client'

import { useEffect } from 'react'

export function CustomCursor() {
  useEffect(() => {
    const cursorDot = document.querySelector('.cursor-dot') as HTMLElement
    const cursorOutline = document.querySelector('.cursor-outline') as HTMLElement

    if (!cursorDot || !cursorOutline) return

    const handleMouseMove = (e: MouseEvent) => {
      const posX = e.clientX
      const posY = e.clientY

      // Simple dot follow
      cursorDot.style.left = `${posX}px`
      cursorDot.style.top = `${posY}px`

      // Smooth outline follow
      cursorOutline.animate(
        {
          left: `${posX}px`,
          top: `${posY}px`,
        },
        { duration: 500, fill: 'forwards' }
      )
    }

    // Hover effects for cursor
    const handleMouseEnter = () => {
      cursorOutline.style.width = '60px'
      cursorOutline.style.height = '60px'
      cursorOutline.style.backgroundColor = 'rgba(196, 109, 94, 0.1)'
      cursorOutline.style.borderColor = '#C46D5E'
    }

    const handleMouseLeave = () => {
      cursorOutline.style.width = '40px'
      cursorOutline.style.height = '40px'
      cursorOutline.style.backgroundColor = 'transparent'
      cursorOutline.style.borderColor = '#1C2321'
    }

    const interactiveElements = document.querySelectorAll(
      'a, button, .group, input, .glass-card, .bento-card'
    )

    window.addEventListener('mousemove', handleMouseMove)
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter)
      el.addEventListener('mouseleave', handleMouseLeave)
    })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })
    }
  }, [])

  return (
    <>
      <div className="cursor-dot hidden md:block" />
      <div className="cursor-outline hidden md:block" />
    </>
  )
}
