# Tasks: Canvas Tools

## Phase 1 — Theme

- [x] Add `swatchChip` and `swatchChipActive` styles to `frontend/src/styles/theme.ts`

## Phase 2 — Toolbar

- [x] Extend `mode` type to `'draw' | 'text' | 'erase'` in `Toolbar` props; add ERASE button
- [x] Add color swatch row to `Toolbar`: accept `activeColor` + `onColorChange` props, render 8 chips from `PALETTE`

## Phase 3 — Canvas

- [x] Accept `color` prop in `Canvas`; apply to `freeDrawingBrush.color` and IText `fill`
- [x] Add erase-mode `mouse:down` handler in `Canvas`: find target and call `fc.remove(target)` to trigger existing Yjs sync

## Phase 4 — CanvasPage

- [x] Add `activeColor` state (init: `userColor(username)`); extend `mode` state type to include `'erase'`; wire `activeColor` into `useAwareness`, `Canvas`, `Toolbar`, and `PresenceBar`
