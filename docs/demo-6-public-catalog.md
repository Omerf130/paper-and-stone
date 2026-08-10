# Demo 6 — Public Catalog + Dynamic Product Pages

Connects the public product experience to MongoDB. Active products appear in the catalog and on dynamic product pages; featured products on the homepage come from the database.

## Scope

Implemented:

- `/products` — public catalog of active products
- `/products/[slug]` — dynamic product pages (replaces Milano-specific route)
- `getPublicProducts()` and `getFeaturedProducts()` data access
- `CatalogProductView` serialization type
- DB-backed homepage Featured Products
- Optional configuration hardening on product page components
- Navigation link to `/products`

**Not implemented:** image uploads, catalog search/filters/pagination, Material library, Projects, pricing.

## Public Routes

```
src/app/(public)/
  products/
    page.tsx              # /products catalog
    [slug]/page.tsx       # /products/{slug}
  page.tsx                # homepage with DB featured products
```

Milano Sofa resolves at `/products/milano-sofa` via the dynamic route — no redirect, no hardcoded route.

## Data Access

| Function | Filter | Limit | Sort |
|----------|--------|-------|------|
| `getPublicProducts()` | `isActive: true` | none (Demo 6 only) | `nameHe: 1` |
| `getFeaturedProducts()` | `isActive: true, isFeatured: true` | 4 | `updatedAt: -1` |
| `getProductBySlug(slug)` | `isActive: true` + slug | 1 | — |

### Large catalog note

`getPublicProducts()` loads all active products without pagination in Demo 6. **This is not the final production catalog strategy.** The expected catalog may eventually contain 1,000+ products. A later phase will add categories, search, filters, pagination/incremental loading, and ordering.

## CatalogProductView

Plain serializable type in [`src/types/catalog.ts`](../src/types/catalog.ts):

```ts
{ slug, nameHe, nameEn?, category, brand? }
```

Mapped via `mapProductToCatalogView()`. No ObjectIds, SKU, or admin fields on public catalog cards.

## Dynamic Product Page

[`src/app/(public)/products/[slug]/page.tsx`](../src/app/(public)/products/[slug]/page.tsx):

1. Read slug from params
2. `getProductBySlug(slug)` → `notFound()` if missing/inactive
3. Reuse existing product components

Components receive `ProductView` — never Mongoose documents.

## Optional Configuration Handling

Products may lack fabrics, colors, sizes, dimensions, or technical fields.

| Component | Behavior |
|-----------|----------|
| `ProductConfigurator` | Config controls only when fabrics/sizes exist; quantity stays client-only (not persisted); no controls for purely informational products |
| `ProductInfo` | Hides empty brand/designer; SKU removed from public display |
| `TechnicalInfo` | Hides entire section or individual blocks when empty |
| `ProductDescription` | Hidden when no long description |
| `TechnicalDrawing` | View tab only when real dimensions exist; labels from actual product values |
| `ProductVisual` | Default `"gray"` tone when no color selection |

Missing dimensions remain missing — never become `0`.

## Technical Drawing (temporary)

Abstract SVG geometry remains a demo placeholder. Dimension labels come from the product's actual values. Real technical/CAD assets are deferred.

## Homepage Featured Products

[`src/app/(public)/page.tsx`](../src/app/(public)/page.tsx) fetches `getFeaturedProducts()`.

- Section hidden when no featured products (no fake hardcoded items)
- Uses shared `ProductCard` component
- Other homepage sections remain local/hardcoded

## Active / Inactive Behavior

| Admin state | Catalog | Product page | Homepage featured |
|-------------|---------|--------------|-------------------|
| `isActive: true` | visible | accessible | eligible if featured |
| `isActive: false` | hidden | 404 | never shown |
| `isFeatured: true` + inactive | hidden | 404 | never shown |

## Rendering / Caching

`export const dynamic = "force-dynamic"` on:

- `/products`
- `/products/[slug]`
- `/` (homepage)

Admin changes to content, `isActive`, or `isFeatured` appear on the next request without redeploy. No ISR or custom revalidation in Demo 6.

## Navigation

`"מוצרים"` in main nav and footer links to `/products`.

## Shared Components

- [`ProductCard`](../src/components/catalog/ProductCard.tsx) — catalog + featured grid item
- [`ProductCatalogGrid`](../src/components/catalog/ProductCatalogGrid.tsx) — `/products` layout

## Tests

Run: `npm run test`

- Public catalog excludes inactive products
- Featured query requires active + featured with limit 4
- Dynamic lookup excludes inactive products
- ProductView optional configuration mapping
- Display helpers for dimensions/config detection

## Deferred

- Image uploads / real photography
- Final color visualization engine
- Material/Fabric library
- Catalog search, filters, pagination
- Category CRUD
- Projects / Add to Project / quantity persistence
- Pricing, cart, checkout
- SEO structured data
- Admin featured ordering field
