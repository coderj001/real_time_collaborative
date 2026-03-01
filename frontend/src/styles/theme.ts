import type { CSSProperties } from 'react'

// Color constants (mirrors CSS variables for JS/SVG use)
export const C = {
  black:     '#0a0a0a',
  dark:      '#001a00',
  green:     '#00ff41',
  greenDim:  '#00cc33',
  borderDim: '#005510',
  amber:     '#ffb000',
  cyan:      '#00ffff',
  red:       '#ff3131',
  white:     '#e8ffe8',
} as const

// Glow text-shadow strings
export const glowGreen = '0 0 4px #00ff41, 0 0 10px rgba(0,255,65,0.2)'
export const glowAmber = '0 0 4px #ffb000, 0 0 10px rgba(255,176,0,0.2)'
export const glowCyan  = '0 0 4px #00ffff, 0 0 10px rgba(0,255,255,0.2)'

// Animation name strings (reference global @keyframes in index.html)
export const ANIM_BLINK    = 'blink 1s steps(1) infinite'
export const ANIM_SLIDE_IN = 'press-start-slide 0.3s steps(4) both'

// Double-border framed panel
export const panel: CSSProperties = {
  background: C.dark,
  padding: '24px',
  border: `2px solid ${C.green}`,
  boxShadow: `inset 0 0 0 4px ${C.black}, inset 0 0 0 6px ${C.green}, 0 0 20px rgba(0,255,65,0.15)`,
}

// Top / status bar base style
export const hudBar: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '6px 12px',
  background: C.dark,
  borderBottom: `1px solid ${C.green}`,
  gap: '8px',
}

// Amber arcade primary button (thick bottom/right for 3D depth)
export const btnPrimary: CSSProperties = {
  padding: '7px 14px',
  background: C.amber,
  color: C.black,
  border: `2px solid ${C.amber}`,
  borderBottomWidth: '4px',
  borderRightWidth: '4px',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '10px',
  letterSpacing: '1px',
  whiteSpace: 'nowrap',
}

// Green outline secondary button
export const btnSecondary: CSSProperties = {
  padding: '7px 14px',
  background: 'transparent',
  color: C.green,
  border: `2px solid ${C.green}`,
  borderBottomWidth: '4px',
  borderRightWidth: '4px',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '10px',
  letterSpacing: '1px',
  whiteSpace: 'nowrap',
}

// Small variant button
export const btnSmall: CSSProperties = {
  padding: '4px 8px',
  background: 'transparent',
  color: C.green,
  border: `1px solid ${C.green}`,
  borderBottomWidth: '3px',
  borderRightWidth: '3px',
  cursor: 'pointer',
  fontSize: '8px',
  letterSpacing: '1px',
  whiteSpace: 'nowrap',
}

// Input field
export const inputField: CSSProperties = {
  padding: '8px 10px',
  background: C.black,
  color: C.green,
  border: `1px solid ${C.green}`,
  fontSize: '11px',
  letterSpacing: '1px',
  outline: 'none',
}

// Cyan glow share code display
export const shareCodeBox: CSSProperties = {
  background: C.black,
  color: C.cyan,
  border: `1px solid ${C.cyan}`,
  padding: '2px 8px',
  fontSize: '13px',
  fontWeight: 700,
  letterSpacing: '3px',
  textShadow: glowCyan,
}

// Section label
export const sectionLabel: CSSProperties = {
  margin: '0 0 10px',
  fontSize: '8px',
  color: C.greenDim,
  textTransform: 'uppercase',
  letterSpacing: '2px',
}

// Error text
export const errorText: CSSProperties = {
  color: C.red,
  fontSize: '9px',
  margin: 0,
  letterSpacing: '1px',
}

// Presence chip base
export const presenceChip: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  background: 'transparent',
  border: `1px solid ${C.green}`,
  padding: '2px 6px 2px 3px',
  fontSize: '8px',
  fontWeight: 700,
  whiteSpace: 'nowrap',
  color: C.green,
}

// Cursor name label
export const cursorLabel: CSSProperties = {
  fontSize: '9px',
  fontWeight: 700,
  padding: '1px 4px',
  whiteSpace: 'nowrap',
  marginTop: '1px',
  letterSpacing: '1px',
}
