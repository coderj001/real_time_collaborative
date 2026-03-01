interface ToolbarProps {
  mode: 'draw' | 'text'
  onModeChange: (mode: 'draw' | 'text') => void
}

export function Toolbar({ mode, onModeChange }: ToolbarProps) {
  const btn = (label: string, value: 'draw' | 'text') => ({
    onClick: () => onModeChange(value),
    style: {
      padding: '6px 14px',
      cursor: 'pointer',
      border: '1px solid #ccc',
      borderRadius: '4px',
      background: mode === value ? '#1a73e8' : '#fff',
      color: mode === value ? '#fff' : '#333',
      fontWeight: mode === value ? 600 : 400,
    },
  })

  return (
    <div style={{ display: 'flex', gap: '8px', padding: '8px 12px', borderBottom: '1px solid #ddd', background: '#fafafa' }}>
      <button {...btn('✏️ Draw', 'draw')}>✏️ Draw</button>
      <button {...btn('T Text', 'text')}>T Text</button>
    </div>
  )
}
