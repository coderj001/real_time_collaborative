import { RemoteUser } from '../hooks/useAwareness'
import { cursorLabel, C } from '../styles/theme'

interface CursorLayerProps {
  remoteStates: Map<number, RemoteUser>
}

export function CursorLayer({ remoteStates }: CursorLayerProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {Array.from(remoteStates.entries()).map(([clientId, state]) => {
        if (!state.cursor) return null
        const { x, y } = state.cursor
        const { name, color } = state.user

        return (
          <div
            key={clientId}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '2px',
              transform: 'translate(0, 0)',
            }}
          >
            <svg width="14" height="18" viewBox="0 0 14 18" style={{ flexShrink: 0 }}>
              <path
                d="M0 0 L0 14 L4 10 L7 17 L9 16 L6 9 L11 9 Z"
                fill={color}
                stroke={C.black}
                strokeWidth="2"
                strokeLinejoin="miter"
              />
            </svg>
            <span
              style={{
                ...cursorLabel,
                background: color,
                color: C.black,
              }}
            >
              {name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
