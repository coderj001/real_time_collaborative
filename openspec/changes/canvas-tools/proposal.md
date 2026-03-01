# Proposal: Canvas Tools

## Summary
Add two new tools to the canvas toolbar: a **color picker** (preset swatches) that changes both drawing color and live cursor/awareness color, and an **eraser** that removes objects from the shared Yjs document so all collaborators see deletions immediately.

## Problem
- All drawing happens in a single fixed color assigned by username hash. Users cannot express themselves or distinguish their own strokes.
- There is no way to remove mistakes. Once an object is drawn, it stays forever.

## Proposed Solution

### Color Picker
Add a row of 8 preset color swatches to the toolbar, using the same `PALETTE` from `colors.ts`. The selected color:
1. Sets `canvas.freeDrawingBrush.color` for draw mode
2. Sets the fill/stroke color for text objects in text mode
3. Updates the local awareness state `color` field — so other users see the cursor change color in real-time via the existing `useAwareness` hook

Initial selected color is the user's assigned `userColor(username)` so the behavior is backward-compatible by default. The swatch UI fits the retro arcade aesthetic — square color chips with a bright border on the active swatch, no color wheel.

### Eraser Tool
Add `"erase"` as a third toolbar mode alongside `"draw"` and `"text"`. In erase mode:
- `canvas.isDrawingMode = false` (same as text mode)
- On `canvas:mouse:down`, find the topmost object under the pointer via `canvas.findTarget()`
- If an object is found, delete it from the Yjs shared `objectsMap` by its `id`
- The deletion propagates via Yjs to all connected peers immediately — the object disappears from all canvases in real-time
- No freehand eraser path; no partial-object erasing; one click removes one object

This approach is clean, deterministic, and works perfectly with the existing Yjs sync model.

## Toolbar Layout After Change
```
[ DRAW ]  [ TEXT ]  [ ERASE ]   ■ ■ ■ ■ ■ ■ ■ ■
                                 (color swatches)
```

## What Does NOT Change
- Backend — no new routes, no schema changes
- Yjs document structure (objects still stored in `objectsMap` keyed by id)
- Canvas.tsx internal draw/text handling (only `mode` prop and awareness color need threading through)
- Cursor color sync mechanism — `useAwareness` already broadcasts the color field; we just update it when the user picks a new color

## Scope
- `frontend/src/styles/theme.ts`: swatch chip styles
- `frontend/src/components/Toolbar.tsx`: add ERASE button + swatch row
- `frontend/src/pages/CanvasPage.tsx`: manage `activeColor` state, pass to Canvas + update awareness
- `frontend/src/components/Canvas.tsx`: accept `color` prop for brush/text; add erase-mode click handler
- `frontend/src/hooks/useAwareness.ts`: accept dynamic color (currently hardcoded at hook init)

## Success Criteria
- User picks a swatch; their subsequent strokes and text use that color
- Other users' cursor arrows update to the new color in real-time
- In erase mode, clicking an object removes it; all connected peers see it vanish immediately
- Active swatch is visually distinguished (bright border)
- Default color on load matches the existing `userColor(username)` assignment
