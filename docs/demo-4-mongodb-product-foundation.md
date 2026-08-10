# Demo 4 — MongoDB + Product Data Foundation

Demo 4 establishes the first production-oriented database layer and migrates the Milano Sofa product page from local demo data to MongoDB.

## Dependencies

- **mongoose** — MongoDB ODM (runtime)
- **tsx** — TypeScript execution for seed script (dev)

## Environment

Set in `.env.local` (not committed):

```
MONGODB_URI=mongodb+srv://...
```

Example template: [`.env.example`](../.env.example)

Missing `MONGODB_URI` throws a clear server-side error — no credentials exposed in messages.

## DB Connection

[`src/lib/db/mongoose.ts`](../src/lib/db/mongoose.ts):

- Cached connection for dev hot reload (global `mongooseCache`)
- `connectDB()` / `disconnectDB()`
- Server-only usage

## Models

### Category ([`src/models/Category.ts`](../src/models/Category.ts))

- nameHe (required), nameEn, slug (unique), isActive, sortOrder, timestamps

### Product ([`src/models/Product.ts`](../src/models/Product.ts))

- Identity: nameHe, nameEn, slug (unique), sku (unique)
- categoryId → Category ref
- Content, status, dimensions, technical fields
- **Embedded transitional config:** fabrics[], sizes[]
  - fabric: `{ key, label, colors: [{ key, label, visualTone? }] }`
  - size: `{ key, label }`

**`visualTone`** is temporary demo visualization metadata for the SVG color switcher — NOT the final 2D architecture or Material library.

The embedded fabrics/colors structure is transitional for the client demo. A centralized Material/Fabric library may replace it after requirements are confirmed.

## Data Flow

```
getProductBySlug(slug)
  → connectDB()
  → Product.findOne({ slug, isActive: true }).populate(categoryId)
  → mapProductToView() → ProductView (plain serializable object)
  → page / ProductConfigurator
```

- [`src/lib/products/getProductBySlug.ts`](../src/lib/products/getProductBySlug.ts) — data access
- [`src/lib/products/mapProductToView.ts`](../src/lib/products/mapProductToView.ts) — Mongo `key` → view `id`, `visualTone` → `VisualTone`
- [`src/types/product.ts`](../src/types/product.ts) — `ProductView` for components

No Mongoose documents, ObjectIds, or `__v` passed to Client Components.

## Product Page

[`/products/milano-sofa`](../src/app/products/milano-sofa/page.tsx):

- `export const dynamic = "force-dynamic"`
- Fetches via `getProductBySlug("milano-sofa")`
- `notFound()` if missing — no hardcoded fallback
- [`demo-product.ts`](../src/components/product/demo-product.ts) removed

## Seed

```bash
npm run seed
```

Runs: `tsx --env-file=.env.local scripts/seed.ts` (uses installed `tsx` devDependency; `--env-file` loads `.env.local` reliably)

[`scripts/seed.ts`](../scripts/seed.ts):

- Loads `.env.local`
- Upserts Category by `{ slug: "sofas" }`
- Upserts Product by `{ slug: "milano-sofa" }` (explicit slug identity)
- Idempotent — safe to run multiple times

## Source-of-Truth Transition

| Before Demo 4 | After Demo 4 |
|---------------|--------------|
| `demo-product.ts` hardcoded Milano data | MongoDB via seed + getProductBySlug |
| Homepage featured products local | Still local (Milano href unchanged) |

## Intentionally Deferred

- Admin UI / CRUD
- Auth, User model
- Catalog page, dynamic `[slug]` route
- Material library model
- Public write API routes
- Homepage featured products from DB
- Uploads, caching strategy
