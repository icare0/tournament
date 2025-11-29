'use client'

import React from 'react'

interface BracketConnectorProps {
  fromX: number
  fromY: number
  toX: number
  toY: number
  className?: string
}

/**
 * SVG path connector between matches
 * Creates smooth L-shaped connection
 */
export function BracketConnector({
  fromX,
  fromY,
  toX,
  toY,
  className = 'bracket-connector',
}: BracketConnectorProps) {
  // Calculate middle point for smooth curve
  const midX = (fromX + toX) / 2

  // Create path with cubic bezier curve
  const path = `
    M ${fromX} ${fromY}
    L ${midX} ${fromY}
    L ${midX} ${toY}
    L ${toX} ${toY}
  `

  return (
    <path
      d={path}
      className={className}
      fill="none"
      strokeWidth={2}
    />
  )
}
