import { RemoteUser } from '../hooks/useAwareness'

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
            {/* Task 4.4: SVG cursor arrow */}
            <svg width="14" height="18" viewBox="0 0 14 18" style={{ flexShrink: 0 }}>
              <path
                d="M0 0 L0 14 L4 10 L7 17 L9 16 L6 9 L11 9 Z"
                fill={color}
                stroke="white"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
            {/* Task 4.5: name label */}
            <span
              style={{
                background: color,
                color: '#fff',
                fontSize: '11px',
                fontFamily: 'sans-serif',
                fontWeight: 600,
                padding: '1px 5px',
                borderRadius: '3px',
                whiteSpace: 'nowrap',
                marginTop: '1px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
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
