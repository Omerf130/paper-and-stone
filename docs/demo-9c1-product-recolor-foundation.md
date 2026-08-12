# Demo 9C.1 — Product Recolor Foundation + Mask Management

Demo 9C.1 adds browser-side product recoloring: one base product photo, one product-specific PNG mask, and many selectable colors from the central Color library.

## Architecture

```text
Admin uploads primary image
Admin uploads PNG mask (same pixel dimensions as primary — browser UX check)
Admin enables dynamic recoloring
Public user selects Color.hex
ProductRecolorCanvas recolors masked region in the browser
```

## Why the mask is on Product

The mask describes the geometry of a specific photographed product (e.g. sofa upholstery region). It does **not** belong on Color or Material library records.

## Data model

### `media.recolorMask`

Reuses the existing `IProductMediaItem` shape with `mediaType: "RECOLOR_MASK"`.

### `recolorConfig`

```ts
{
  enabled: boolean;
  sourceImageMediaId?: ObjectId;  // binds mask to current primary image
  status: "ready" | "missing_primary" | "missing_mask" | "invalid_source";
}
```

- **Source image:** primary image only (Demo 9C.1)
- **Binding:** `sourceImageMediaId` stores `primaryImage._id` when mask is uploaded
- **Primary replacement:** disables recolor, sets `invalid_source`, keeps mask for admin review

## Mask rules

- Product-specific
- One mask per product
- One recolorable region
- **PNG only** (max 5 MB)
- White/opaque = recolor; black/transparent = preserve
- Manual upload only — no AI segmentation, no in-browser editor

## Dimension validation (Demo 9C.1)

**No server-side image parsing.**

| Layer | Behavior |
|-------|----------|
| Admin UX | Browser loads mask file + primary URL; blocks upload if width/height differ |
| Public runtime | `ProductRecolorCanvas` compares `naturalWidth`/`naturalHeight`; falls back to `ProductImage` on mismatch |

Persisted `width`/`height` on media items remain optional and are **not** required for recolor readiness.

## Storage

Vercel Blob via existing client upload architecture:

```text
products/{productId}/recolor-mask/{uuid}-{safeFilename}
```

Replace/delete follows MongoDB-authoritative + best-effort blob delete (same as Demo 8B).

## Recolor algorithm

Canvas 2D, luminance-preserving HSL method (`applyLuminancePreservingRecolor`):

1. For each masked pixel, keep original **lightness**
2. Apply target color **hue/saturation** from `Color.hex`
3. Blend using mask strength (alpha or grayscale luminance)

This preserves shadows, folds, and highlights better than flat tinting.

**Strongly colored source photos:** hue is replaced in the masked region while lightness is preserved. Neutral/gray studio photography generally produces the best results (recommended, not required).

## CORS

Blob public URLs require `crossOrigin = "anonymous"` before drawing to canvas. Vercel Blob public storage serves `Access-Control-Allow-Origin: *` for existing blobs.

If canvas readback fails, the UI falls back to the normal product image.

## Public behavior

Recolor shows when:

- `recolor.enabled`
- source + mask exist
- `status === "ready"`
- selected gallery image is the recolor source (primary)
- user selected a color

Gallery images are **not** recolored. Returning to the primary thumbnail resumes recolor.

Color changes update the canvas immediately with **no network request**.

## Admin workflow

Section **"צביעה דינמית"** on `/admin/products/[id]`:

1. Upload primary image (existing media manager)
2. Create mask in-browser via **"יצירת מסכה"** or upload PNG manually
3. Preview recolor with product material colors
4. Enable/disable dynamic recoloring

If primary image is replaced after a mask exists: recolor disables, mask is kept, admin must upload a matching mask.

## Limitations (Demo 9C.1)

- Primary image only
- Single mask region
- Manual mask authoring
- Canvas 2D only (no WebGL)
- No texture mapping or fabric swatch images
- Browser dimension checks are UX/runtime safety, not a security boundary

## Deferred (Demo 9C.3+)

- AI / assisted mask generation
- Multiple mask regions
- Server-side dimension extraction (Sharp)
- Recolor on gallery images
- Web Workers for very large images
