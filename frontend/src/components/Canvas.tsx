import { useEffect, useRef } from 'react'
import { fabric } from 'fabric'
import * as Y from 'yjs'

interface CanvasProps {
  doc: Y.Doc
  mode: 'draw' | 'text'
}

export function Canvas({ doc, mode }: CanvasProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<fabric.Canvas | null>(null)
  // Guard to prevent echo: local fabric changes → Y.Map → back to fabric
  const isRemoteUpdate = useRef(false)

  // ── Task 3.3: initialize fabric.Canvas ──────────────────────────────────
  useEffect(() => {
    if (!canvasElRef.current) return

    const fc = new fabric.Canvas(canvasElRef.current, {
      width: Math.max(window.innerWidth - 4, 800),
      height: Math.max(window.innerHeight - 80, 600),
      backgroundColor: '#ffffff',
      selection: true,
    })
    fabricRef.current = fc

    return () => {
      fc.dispose()
      fabricRef.current = null
    }
  }, [])

  // ── Task 3.3 / 3.6: switch draw / select mode ───────────────────────────
  useEffect(() => {
    const fc = fabricRef.current
    if (!fc) return

    if (mode === 'draw') {
      fc.isDrawingMode = true
      if (!fc.freeDrawingBrush) {
        fc.freeDrawingBrush = new fabric.PencilBrush(fc)
      }
      fc.freeDrawingBrush.width = 3
      fc.freeDrawingBrush.color = '#000000'
    } else {
      fc.isDrawingMode = false
    }
  }, [mode])

  // ── Task 3.7: click-to-add IText in text mode ───────────────────────────
  useEffect(() => {
    const fc = fabricRef.current
    if (!fc || mode !== 'text') return

    const onMouseDown = (e: fabric.IEvent) => {
      if (e.target) return // clicked on existing object
      const pointer = fc.getPointer(e.e as MouseEvent)
      const text = new fabric.IText('Type here…', {
        left: pointer.x,
        top: pointer.y,
        fontSize: 20,
        fill: '#000000',
      })
      fc.add(text)
      fc.setActiveObject(text)
      text.enterEditing()
      text.selectAll()
    }

    fc.on('mouse:down', onMouseDown)
    return () => {
      fc.off('mouse:down', onMouseDown)
    }
  }, [mode])

  // ── Tasks 3.4 + 3.5: yjs ↔ fabric binding with isRemoteUpdate guard ─────
  useEffect(() => {
    const fc = fabricRef.current
    if (!fc) return

    const objectsMap = doc.getMap<Record<string, unknown>>('objects')

    // Fabric → Y.Map
    const onAdded = (e: any) => {
      if (isRemoteUpdate.current || !e.target) return
      const obj: any = e.target
      if (!obj.id) obj.id = crypto.randomUUID()
      const data = obj.toObject(['id'])
      doc.transact(() => objectsMap.set(obj.id, data))
    }

    const onModified = (e: any) => {
      if (isRemoteUpdate.current || !e.target) return
      const obj: any = e.target
      if (!obj.id) return
      const data = obj.toObject(['id'])
      doc.transact(() => objectsMap.set(obj.id, data))
    }

    const onRemoved = (e: any) => {
      if (isRemoteUpdate.current || !e.target) return
      const id = e.target.id
      if (id) doc.transact(() => objectsMap.delete(id))
    }

    // Task 3.7: sync IText content changes (not covered by object:modified)
    const onTextChanged = (e: any) => {
      if (isRemoteUpdate.current || !e.target) return
      const obj: any = e.target
      if (!obj.id) obj.id = crypto.randomUUID()
      const data = obj.toObject(['id'])
      doc.transact(() => objectsMap.set(obj.id, data))
    }

    // Y.Map → fabric (task 3.4)
    const onMapChange = (event: Y.YMapEvent<Record<string, unknown>>) => {
      event.changes.keys.forEach((change, key) => {
        if (change.action === 'delete') {
          const existing = fc.getObjects().find((o: any) => o.id === key)
          if (existing) {
            isRemoteUpdate.current = true
            fc.remove(existing)
            isRemoteUpdate.current = false
            fc.renderAll()
          }
        } else {
          const data = objectsMap.get(key)
          if (!data) return
          fabric.util.enlivenObjects(
            [data],
            (enlivened: fabric.Object[]) => {
              isRemoteUpdate.current = true
              const existing = fc.getObjects().find((o: any) => o.id === key)
              if (existing) fc.remove(existing)
              if (enlivened[0]) fc.add(enlivened[0])
              fc.renderAll()
              isRemoteUpdate.current = false
            },
            ''
          )
        }
      })
    }

    fc.on('object:added', onAdded)
    fc.on('object:modified', onModified)
    fc.on('object:removed', onRemoved)
    fc.on('text:changed', onTextChanged)
    objectsMap.observe(onMapChange)

    return () => {
      fc.off('object:added', onAdded)
      fc.off('object:modified', onModified)
      fc.off('object:removed', onRemoved)
      fc.off('text:changed', onTextChanged)
      objectsMap.unobserve(onMapChange)
    }
  }, [doc])

  return (
    <div style={{ flex: 1, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
      <canvas ref={canvasElRef} />
    </div>
  )
}
