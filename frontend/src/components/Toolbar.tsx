import { btnPrimary, btnSecondary, hudBar, swatchChip, swatchChipActive } from '../styles/theme'
import { PALETTE } from '../utils/colors'

type Mode = 'draw' | 'text' | 'erase'

interface ToolbarProps {
  mode: Mode
  onModeChange: (mode: Mode) => void
  activeColor: string
  onColorChange: (color: string) => void
}

export function Toolbar({ mode, onModeChange, activeColor, onColorChange }: ToolbarProps) {
  return (
    <div style={{ ...hudBar, gap: '8px', borderBottom: 'none' }}>
      <button
        onClick={() => onModeChange('draw')}
        className="retro-btn"
        style={{ ...(mode === 'draw' ? btnPrimary : btnSecondary), fontSize: '8px' }}
      >
        DRAW
      </button>
      <button
        onClick={() => onModeChange('text')}
        className="retro-btn"
        style={{ ...(mode === 'text' ? btnPrimary : btnSecondary), fontSize: '8px' }}
      >
        TEXT
      </button>
      <button
        onClick={() => onModeChange('erase')}
        className="retro-btn"
        style={{ ...(mode === 'erase' ? btnPrimary : btnSecondary), fontSize: '8px' }}
      >
        ERASE
      </button>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginLeft: '8px' }}>
        {PALETTE.map(color => (
          <div
            key={color}
            onClick={() => onColorChange(color)}
            style={{
              ...(activeColor === color ? swatchChipActive : swatchChip),
              background: color,
            }}
          />
        ))}
      </div>
    </div>
  )
}
