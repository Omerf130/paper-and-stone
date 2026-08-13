# Demo 13 — Public Catalog Redesign

Editorial redesign of `/products` and catalog presentation components. Presentation-only — no schema, query, URL, or pagination semantic changes.

## Goals

- Premium image-led catalog aligned with Demo 12 product page
- Typography-led category navigation and compact search
- Product-tile presentation (not boxed ecommerce cards)
- Homepage featured products **visually isolated** until Demo 14

## Architecture

```
/products/page.tsx (Server)
  ├── getPublicCategories + getPublicProducts (unchanged)
  ├── CatalogHero
  ├── CatalogToolbar (CatalogSearchForm GET + CatalogCategoryFilter links)
  ├── CatalogResultSummary (contextual label helper)
  ├── ProductCatalogGrid → ProductCard variant="catalog"
  ├── CatalogPagination
  └── CatalogEmptyState
```

**URL params preserved:** `q`, `category`, `page`

## Homepage Isolation (Approved Adjustment)

`ProductCard` and `CatalogProductImage` accept an optional presentation variant:

| Variant | Used by | Image fit | Hover |
|---------|---------|-----------|-------|
| `default` | Homepage `FeaturedProductsSection` | `cover` | name → accent color |
| `catalog` | `/products` grid | `contain` | title underline + subtle image scale |

No changes to `FeaturedProductsSection` layout, grid (4-col wide), or section styling.

## New Components

| Component | Role |
|-----------|------|
| `CatalogHero` | Eyebrow + H1 "מוצרים" + supporting copy |
| `CatalogToolbar` | Search + category nav row |
| `CatalogEmptyState` | Editorial empty states with reset link |

## New Helpers

| Helper | Role |
|--------|------|
| `getCatalogResultSummaryLabel` | Contextual `{n} מוצרים` / filter-aware labels |
| `getCatalogEmptyState` | Global, search, category, combined empty copy |

## Layout

- **Container:** `variant="wide"` (90rem, matches Demo 12)
- **375px:** 1 column grid
- **768px+:** 2 columns
- **1280px+:** 3 columns
- **Image frame:** 3:4, `object-fit: contain` (catalog variant only)

## Unchanged

- Query semantics, page size (12), pagination math
- Category model (no Collection entity)
- Product detail page (Demo 12)
- Homepage sections and category tiles
- Header / Footer
- Featured badges (not shown on catalog)

## Files

**Added:** `CatalogHero/*`, `CatalogToolbar/*`, `CatalogEmptyState/*`, catalog label/empty helpers + tests

**Modified:** `page.tsx`, `ProductCard*`, `CatalogProductImage*`, `ProductCatalogGrid*`, `CatalogCategoryFilter.module.scss`, `CatalogSearchForm.module.scss`, `CatalogResultSummary*`, `CatalogPagination.module.scss`

**Removed:** `page.module.scss` (styles moved to components)

## Verification

Run `npm run lint`, `npm test`, `npm run build`.

Manual QA at 375 / 768 / 1024 / 1440px. Explicitly verify Homepage featured products and Demo 12 product detail unchanged.
