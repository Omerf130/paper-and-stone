# Demo 9C.2 — Admin Mask Creator

Demo 9C.2 adds an in-browser mask editor so admins can mark recolorable regions without external tools like Photoshop.

## Workflow

```text
Admin uploads primary image
Admin clicks "יצירת מסכה"
ProductMaskEditor opens inline
Admin paints / erases / fills recolorable region
Admin previews recolor with product colors
Admin saves → PNG exported at natural dimensions
PNG uploads via existing recolor-mask Vercel Blob pipeline
Public ProductRecolorCanvas uses the new mask immediately
```

Manual PNG upload remains available as **"העלאת מסכה קיימת"**.

## Natural coordinate system

The editor displays the image scaled to fit the admin viewport, but all mask mutations happen in **natural image coordinates** (the primary image's `naturalWidth × naturalHeight`).

```text
displayToNatural:
  xNat = (clientX - canvasLeft - offsetX) / scale
  yNat = clamp(yNat, 0, naturalWidth - 1)
```

Brush radius, fill, and export always operate at natural resolution. The exported PNG is always `naturalWidth × naturalHeight`, never viewport-sized.

## Canvas architecture

| Layer | Resolution | Purpose |
|-------|------------|---------|
| `sourceCanvas` (offscreen) | natural | Primary image, loaded once |
| `maskCanvas` (offscreen) | natural | Authoritative mask bitmap |
| `displayCanvas` (visible) | CSS-sized | Composited view + pointer input |

Display composite:
1. Draw scaled source image
2. Draw semi-transparent red overlay from mask (editor UI only)
3. Overlay color is never baked into the saved mask

## Tools

| Tool | Behavior |
|------|----------|
| Paint | Circular brush, white opaque pixels in natural space |
| Erase | Circular brush, clears mask pixels |
| Fill | Flood-fill contiguous empty region |
| Brush size | 8–120 natural pixels |
| Undo / Redo | Stroke-start alpha snapshots |
| Clear | Reset entire mask |
| Zoom | Fit / 100% / 150% / 200% with scroll container |

## Undo / redo memory strategy

History stores **alpha-only snapshots** (1 byte per pixel) at stroke start, not full RGBA `ImageData`.

**Combined undo + redo budget:**

```text
snapshotSize = naturalWidth * naturalHeight bytes
effectiveMaxStates = max(1, min(12, floor(64MB / snapshotSize)))
```

| Rule | Value |
|------|-------|
| Absolute max states | 12 |
| Combined memory budget | 64 MB (undo + redo together) |
| Minimum states | 1 (when technically possible) |

When undo moves a snapshot to redo (and vice versa), ownership is **transferred** — no clone on stack transfer.

New edits clear the redo stack. All history is cleared when the editor unmounts.

Example: 2400×1600 image → ~3.8 MB per snapshot → up to 12 states.  
8000×8000 image → ~64 MB per snapshot → 1 state only.

The authoritative mask is **never downscaled** to save history memory.

## Mask output format

Exported PNG:
- **Outside** recolorable region: fully transparent `RGBA(0,0,0,0)`
- **Inside** recolorable region: white opaque `RGBA(255,255,255,255)`

Compatible with existing `getMaskStrength()` in Demo 9C.1 renderer.

Export uses `canvas.toBlob("image/png")` — no base64 in MongoDB.

## Existing mask editing

When `recolorConfig.status === "ready"` and a mask exists:
- Editor loads existing mask URL via CORS (`crossOrigin = "anonymous"`)
- Pixels with `getMaskStrength > 0` become painted
- Save replaces mask through normal upload/replace flow

When `recolorConfig.status === "invalid_source"` (primary replaced):
- Warning shown; editor starts with **blank mask**
- Old mask file remains in DB until new mask is saved
- Old mask is **not** loaded onto the new primary

## Storage integration

Reuses existing slot `"recolor-mask"`:

```text
Canvas → PNG File → uploadRecolorMaskFile()
  → prepareMediaUploadAction
  → @vercel/blob/client upload
  → finalizeMediaUploadAction
  → Product.media.recolorMask
  → bindRecolorMaskToPrimary → status "ready"
```

No new API routes or storage architecture.

## Recolor preview

Editor toggles between **עריכת מסכה** and **תצוגת צביעה**.

Preview mode exports current mask to a temporary blob URL and renders `ProductRecolorCanvas` with product material colors. Preview color is not persisted.

## Responsive limitations

Desktop-first. Touch drawing works via Pointer Events. Helper copy on narrow viewports: "לעריכה מדויקת מומלץ להשתמש במסך גדול."

## Accessibility limitations

Canvas drawing requires pointer input and is not fully keyboard-accessible. Tool buttons use labels and `aria-pressed`. Manual PNG upload remains an alternative path.

## Performance

- Hot path uses refs + `requestAnimationFrame` compositing
- No React state updates on `pointermove`
- Source image loaded once; mask exported only on preview toggle and save

## Future AI segmentation

Planned flow (not implemented in 9C.2):

```text
AI model → proposed mask Blob
  → importMaskFromImageData()
  → ProductMaskEditor (manual edge fixes)
  → same uploadRecolorMaskFile() pipeline
```

Technologies like Meta's [Segment Anything](https://segment-anything.com/) could provide promptable mask initialization without a separate admin workflow.

## Key files

- [`src/components/admin/ProductMaskEditor/ProductMaskEditor.tsx`](../src/components/admin/ProductMaskEditor/ProductMaskEditor.tsx)
- [`src/lib/recolor/mask-editor/`](../src/lib/recolor/mask-editor/)
- [`src/lib/media/upload-recolor-mask-client.ts`](../src/lib/media/upload-recolor-mask-client.ts)
- [`src/components/admin/ProductRecolorManager/ProductRecolorManager.tsx`](../src/components/admin/ProductRecolorManager/ProductRecolorManager.tsx)
