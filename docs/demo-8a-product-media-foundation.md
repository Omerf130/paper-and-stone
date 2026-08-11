# Demo 8A — Product Media Foundation

Foundation for product media management. MongoDB stores metadata and provider references only — never binary data.

## Scope

Implemented:

- Embedded `Product.media` schema (`primaryImage`, `gallery[]`, `technicalDrawing`)
- Provider-agnostic media types and `MediaStorageProvider` interface (no implementation)
- Public serializers (`PublicImageView`) — url, alt, width, height only
- Extended `ProductView` and `CatalogProductView` with media fields
- Catalog/product data-access projections for primary image
- `ProductCard` and `ProductConfigurator` render real images when present, placeholders/demo fallbacks when absent
- Focused mapping/fallback tests

**Not implemented:** Vercel Blob SDK, env vars, uploads, delete/replace, admin media UI, gallery thumbnails UI, fabric/color image association.

## Storage Provider Decision

**Selected for Demo 8B:** [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) via `@vercel/blob`

**Not installed in Demo 8A.** No `BLOB_READ_WRITE_TOKEN`, no upload Server Actions, no Blob integration.

Future flow:

```
Product Media (Admin)
  → MediaStorageProvider (interface)
  → Vercel Blob implementation (Demo 8B)
```

The interface is intentionally minimal:

- `upload({ key, data, contentType })`
- `delete(storageKey)`

Application code must not call Vercel Blob APIs directly outside the provider implementation.

## Embedded Media Model

```ts
Product.media: {
  primaryImage?: ProductMediaItem;
  gallery: ProductMediaItem[];      // additional images only
  technicalDrawing?: ProductMediaItem;
}
```

Each `ProductMediaItem` stores:

| Field | Purpose |
|-------|---------|
| `storageKey` | Provider object key (admin/server only) |
| `url` | Public CDN URL |
| `mediaType` | `PRODUCT_IMAGE` or `TECHNICAL_DRAWING` |
| `mimeType` | Stored for future validation |
| `originalFilename` | Admin display |
| `byteSize` | Stored for future limits |
| `width`, `height` | Optional dimensions for layout |
| `altText` | Optional Hebrew alt |
| `sortOrder` | Gallery ordering |
| `createdAt` | Audit |

Provider-agnostic naming — no Blob-specific fields.

New products default to `{ gallery: [] }`. Existing products without `media` continue to work via mapper fallbacks.

## Public Serialization

[`PublicImageView`](../src/types/product-media.ts):

```ts
{ url, alt, width?, height? }
```

[`mapProductMediaToPublic.ts`](../src/lib/media/mapProductMediaToPublic.ts) strips `storageKey` and all admin metadata.

| View | Media fields |
|------|--------------|
| `CatalogProductView` | `primaryImage` only |
| `ProductView` | `primaryImage`, `gallery[]`, `technicalDrawing` |

## Public Page Behavior

### Catalog / featured (`ProductCard`)

- `primaryImage` exists → `CatalogProductImage` (Next.js `Image`)
- No primary image → existing `VisualPlaceholder`

### Product page (`ProductConfigurator`)

| View | Has media | Fallback |
|------|-----------|----------|
| Product | `primaryImage` | `ProductVisual` demo SVG + tone |
| Drawing | `technicalDrawing` | `TechnicalDrawing` generated SVG |
| Drawing tab | neither drawing nor dimensions | hidden |

Gallery is mapped on `ProductView` but **no gallery/thumbnail UI** in Demo 8A.

## Admin

**Unchanged in Demo 8A.** No upload UI, no disabled manager, no "coming soon" section.

Create flow remains: save product → redirect to edit. Media upload arrives in Demo 8B.

## Next.js Image

`next.config.ts` **not modified** — remote image patterns for Vercel Blob hostnames will be configured in Demo 8B when integration exists.

Until then, products without uploaded media continue using placeholders; no runtime impact.

## Future Demo 8B

1. Configure Vercel Blob store + `BLOB_READ_WRITE_TOKEN`
2. Install `@vercel/blob`
3. Implement `MediaStorageProvider`
4. Add `ProductMediaManager` on `/admin/products/[id]`
5. Upload / replace / delete Server Actions with admin auth + validation
6. Configure `images.remotePatterns` for Blob CDN hostname

## Deferred

- Fabric/color → image association
- Automatic recoloring / 2D visualization
- Gallery reorder UI, drag-and-drop
- CAD, PDF, video
- Material library assets
- MIME inspection, dimension extraction at upload
- Orphan storage cleanup job
- Open Graph / SEO images

See [`docs/project-foundation.md`](project-foundation.md).
