# Design: Canvas Tools

## Architecture

All changes are frontend-only. No backend routes or Yjs document structure changes.

```
CanvasPage
  ├── activeColor state (useState, init = userColor(username))
  ├── mode state (extended to 'draw' | 'text' | 'erase')
  │
  ├── Toolbar
  │     ├── DRAW / TEXT / ERASE buttons (mode)
  │     └── Color swatches (activeColor, onColorChange)
  │
  ├── Canvas
  │     ├── color prop → freeDrawingBrush.color + IText fill
  │     └── erase mode → mouse:down → fc.remove(target) → existing Yjs sync
  │
  └── useAwareness(provider, username, activeColor)
        └── color change → re-runs effect → awareness.setLocalState updates
```

## Color Picker

`activeColor` state lives in `CanvasPage`, initialized to `userColor(username)` for backward compatibility.

Passed down to:
- `Toolbar` as `activeColor` + `onColorChange`
- `Canvas` as `color` prop
- `useAwareness` as the `color` argument (already wired; just swap constant → state)
- `PresenceBar` as `localUser.color`

Swatch UI in `Toolbar`: 8 square chips from `PALETTE` in `colors.ts`. Active chip has a bright white border; inactive has a dim border. Styles (`swatchChip`, `swatchChipActive`) added to `theme.ts`.

## Erase Tool

Mode type extended: `'draw' | 'text' | 'erase'`.

In `Canvas.tsx`, a `useEffect` on `mode === 'erase'` registers a `mouse:down` handler:
```ts
const onMouseDown = (e: fabric.IEvent) => {
  const target = e.target
  if (target) fc.remove(target)
}
```

Calling `fc.remove(target)` triggers the existing `object:removed` Yjs listener → `objectsMap.delete(id)` → Yjs broadcasts deletion to all peers. No separate Yjs call needed.

`isDrawingMode = false` in erase mode (same as text mode).

## Canvas `color` Prop

Two effects in `Canvas.tsx` currently hardcode `'#000000'`:
1. `freeDrawingBrush.color = '#000000'` in the mode-switch effect
2. `fill: '#000000'` in the IText creation handler

Both updated to use the incoming `color` prop. The mode-switch effect already depends on `[mode]`; adding `color` to the dep array ensures brush color updates when color changes while in draw mode.

## useAwareness (no code change required)

`useAwareness` already accepts `color` as a parameter in its dependency array `[provider, username, color]`. When `activeColor` state changes in `CanvasPage` and is passed as `color`, the effect re-runs and calls:
```ts
awareness.setLocalState({ user: { name: username, color }, cursor: null })
```
This broadcasts the new color to all peers immediately via the existing awareness channel.

## Toolbar Layout
```
[ DRAW ]  [ TEXT ]  [ ERASE ]   ■ ■ ■ ■ ■ ■ ■ ■
                                 (color swatches)
```
The swatch row sits to the right of the mode buttons, inside the same `hudBar` div, separated by a flex gap.
