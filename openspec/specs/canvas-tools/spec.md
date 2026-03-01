# Spec: Canvas Tools

## Color Picker

- The toolbar displays 8 preset color swatches using the `PALETTE` from `colors.ts`
- The active swatch is visually distinguished (bright white border)
- Selecting a swatch updates the drawing color for subsequent strokes and text
- Selecting a swatch updates the local awareness color; other users see the cursor color change immediately
- The default selected color on page load is `userColor(username)` (backward-compatible)
- No color wheel or free input — preset swatches only

## Eraser Tool

- The toolbar has a third mode button: `ERASE`
- In erase mode, clicking on a canvas object removes it
- Deletion propagates via Yjs to all connected peers immediately
- Clicking on empty canvas area in erase mode does nothing
- No freehand eraser path; no partial-object erasing; one click removes one complete object

## Mode Type

- `mode` is one of `'draw' | 'text' | 'erase'`
- ERASE button uses the same retro-btn arcade style as DRAW/TEXT

## Brush / Text Color

- In draw mode, `freeDrawingBrush.color` reflects the active color
- In text mode, new IText objects are created with `fill` set to the active color
- Existing objects on canvas are not retroactively recolored
