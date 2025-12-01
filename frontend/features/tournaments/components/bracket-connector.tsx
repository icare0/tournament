/**
 * BracketConnector - Bézier curve connections between matches
 */

import React from 'react'
import { BracketConnectorProps } from '../types/bracket'

export const BracketConnector: React.FC<BracketConnectorProps> = React.memo(
  ({ connection, config, isHighlighted = false }) => {
    const { fromX, fromY, toX, toY, type } = connection

    // Calculate Bézier control points for smooth curves
    const controlPointOffset = (toX - fromX) * config.connectorCurve

    const path = `
      M ${fromX},${fromY}
      C ${fromX + controlPointOffset},${fromY}
        ${toX - controlPointOffset},${toY}
        ${toX},${toY}
    `

    return (
      <path
        d={path}
        stroke={
          isHighlighted
            ? 'hsl(var(--primary))'
            : type === 'loser'
            ? 'hsl(var(--destructive) / 0.3)'
            : 'hsl(var(--border))'
        }
        strokeWidth={isHighlighted ? config.connectorStrokeWidth + 1 : config.connectorStrokeWidth}
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-200"
        style={{
          filter: isHighlighted ? 'drop-shadow(0 0 4px hsl(var(--primary) / 0.5))' : undefined,
        }}
      />
    )
  },
  (prev, next) =>
    prev.connection.id === next.connection.id && prev.isHighlighted === next.isHighlighted
)

BracketConnector.displayName = 'BracketConnector'
