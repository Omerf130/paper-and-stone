# Demo 8B — Vercel Blob Uploads + Admin Product Media Manager

Working admin media management for product primary image, gallery, and technical drawing. Files stored in Vercel Blob; MongoDB stores metadata and references only.

## Dependencies

- `@vercel/blob` — client upload (`upload()`), server `handleUpload`, blob delete (`del()`)

**Not installed:** `file-type`, Sharp, multer, Cloudinary, S3 SDK.

## Environment

```
BLOB_STORE_ID=
BLOB_READ_WRITE_TOKEN=
```

Server-only. Never expose via `NEXT_PUBLIC_*` or client payloads.

## Upload architecture

```
Browser → @vercel/blob/client upload()
       → POST /api/admin/products/[id]/media/upload (handleUpload)
       → direct upload to Vercel Blob
       → onUploadCompleted → MongoDB
       → finalizeMediaUploadAction (idempotent fallback for local/dev)
```

**No Server Action file upload path** — avoids Vercel Function ~4.5 MB body limit (technical drawings up to 10 MB).

### Security boundary

Authoritative validation happens in **`onBeforeGenerateToken`** on every token request:

1. Current user is admin
2. `productId` is valid and product exists
3. Client payload shape is valid (`slot`, optional `altText`)
4. Pathname belongs to `products/{productId}/{slot}/`
5. Gallery has room when `slot = gallery`
6. `allowedContentTypes`: jpeg, png, webp
7. `maximumSizeInBytes`: 5 MB (primary/gallery) or 10 MB (technical)

`prepareMediaUploadAction` only generates pathname/clientPayload for UX — **not trusted**. Client may alter values; token issuance re-validates everything.

**Magic-byte verification is deferred.** Client `file.type` / `file.size` checks are UX-only.

## File limits

| Slot | MIME | Max size | Max count |
|------|------|----------|-----------|
| Primary | jpeg/png/webp | 5 MB | 1 |
| Gallery | jpeg/png/webp | 5 MB each | 8 |
| Technical | jpeg/png/webp | 10 MB | 1 |

Rejected via token: SVG, GIF, PDF, AVIF.

## Storage paths

```
products/{productId}/primary/{uuid}-{safeFilename}
products/{productId}/gallery/{uuid}-{safeFilename}
products/{productId}/technical/{uuid}-{safeFilename}
```

- `storageKey` = Blob pathname
- `url` = public CDN URL
- `width` / `height` = undefined in Demo 8B

## Replace / delete order

**Replace:** upload new → update MongoDB → delete old blob best-effort. DB failure → delete new blob best-effort.

**Delete:** remove MongoDB reference → delete blob best-effort.

Delete/reorder resolve media by MongoDB subdoc `_id` — never trust client `storageKey`/`url`.

## Admin UI

`/admin/products/[id]` — `ProductForm` then `ProductMediaManager`:

1. תמונה ראשית
2. גלריה (max 8, move up/down, 0-based `sortOrder`)
3. שרטוט טכני

Create page shows helper text only — no media manager until product exists.

## Public integration

- Catalog/featured: existing `primaryImage` on `ProductCard`
- Product page: hero image + simple gallery thumbnail strip in `ProductConfigurator`
- Technical drawing tab: uploaded image or generated SVG fallback
- No fabric/color image association or recoloring

## Next.js Image

`next.config.ts` — `images.remotePatterns` for `{BLOB_STORE_ID}.public.blob.vercel-storage.com`.

## Key files

| Path | Role |
|------|------|
| `src/lib/media/vercel-blob-storage-provider.ts` | Blob delete wrapper |
| `src/lib/media/upload-token-validation.ts` | Token issuance validation |
| `src/app/api/admin/products/[id]/media/upload/route.ts` | handleUpload route |
| `src/app/admin/products/media-actions.ts` | Prepare, finalize, delete, reorder, alt |
| `src/components/admin/ProductMediaManager/` | Admin UI |

## Deferred

Fabric/color media, magic-byte verification, Sharp dimensions, lightbox/zoom, cleanup jobs, CAD/PDF.
