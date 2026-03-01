import { btnPrimary, btnSecondary, hudBar } from '../styles/theme'

interface ToolbarProps {
  mode: 'draw' | 'text'
  onModeChange: (mode: 'draw' | 'text') => void
}

export function Toolbar({ mode, onModeChange }: ToolbarProps) {
  return (
    <div style={{ ...hudBar, gap: '8px', borderBottom: 'none' }}>
      <button
        onClick={() => onModeChange('draw')}
        className="retro-btn"
        style={{
          ...(mode === 'draw' ? btnPrimary : btnSecondary),
          fontSize: '8px',
        }}
      >
        DRAW
      </button>
      <button
        onClick={() => onModeChange('text')}
        className="retro-btn"
        style={{
          ...(mode === 'text' ? btnPrimary : btnSecondary),
          fontSize: '8px',
        }}
      >
        TEXT
      </button>
    </div>
  )
}
