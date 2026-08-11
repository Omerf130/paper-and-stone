# Demo 7B — Catalog Search + Category Filtering + Pagination

Scalable public catalog at `/products` with URL-driven search, active-category filtering, and server-side pagination.

## Scope

Implemented:

- URL search params: `q`, `category`, `page`
- Server-side search (nameHe, nameEn, brand, designer, sku)
- Active category filter by slug
- Pagination (12 products per page, skip/limit)
- Result count summary
- Empty states (no products / no results)
- `getPublicCategories()` for filter UI
- Pure `buildProductCatalogFilter()` + separate slug resolution
- Compound index `{ isActive: 1, categoryId: 1 }`

**Not implemented:** advanced filters, sorting UI, Atlas Search, autocomplete, infinite scroll, admin search, public category landing pages.

## URL State

The URL is the single source of truth.

| Param | Meaning |
|-------|---------|
| `q` | optional search query |
| `category` | optional active category slug |
| `page` | optional page number (default 1) |

Examples:

```
/products
/products?q=milano
/products?category=sofas
/products?q=milano&category=sofas
/products?page=2
/products?q=chair&category=seating&page=3
```

### Preservation rules

- Search submit: preserve `category`, reset `page`
- Category change: preserve `q`, reset `page`
- Pagination links: preserve `q` and `category`

All interactions use native GET forms or Next.js `<Link>` — no client-side duplicate state.

## Data Flow

```
/products searchParams
  → parseCatalogParams()
  → getPublicCategories()
  → getPublicProducts({ query, categorySlug, page, pageSize })
      → resolveActiveCategorySlug(categorySlug)   // MongoDB
      → buildProductCatalogFilter({ query, categoryId })  // pure
      → countDocuments(filter)
      → calculatePagination()
      → find(filter).skip().limit()
```

## Search

Fields searched (case-insensitive substring via escaped regex):

- `nameHe`
- `nameEn`
- `brand`
- `designer`
- `sku`

[`escapeRegex()`](../src/lib/catalog/escape-regex.ts) escapes user input before creating `RegExp`.

SKU is searchable but **not displayed** on public `ProductCard`.

**Limitation:** regex `$or` across multiple fields is not fully index-efficient. Acceptable for Demo 7B. Future scale may justify MongoDB Atlas Search — not implemented now.

## Category Filtering

- URL exposes category **slug** only (never ObjectId)
- [`resolveActiveCategorySlug()`](../src/lib/catalog/resolve-active-category-slug.ts) resolves active categories server-side
- [`getPublicCategories()`](../src/lib/catalog/getPublicCategories.ts) returns `{ slug, nameHe }` for filter UI

### Invalid / inactive category slug

When `?category=<slug>` is unknown or inactive:

- Do not crash
- Ignore category filter (query runs without `categoryId`)
- Filter UI shows **"הכל"** as active
- No Product documents modified

### Inactive category + active product

| Scenario | Behavior |
|----------|----------|
| General catalog | Active product still visible |
| Card category label | Shows referenced category name via populate |
| Filter UI | Inactive category not listed |
| `?category=<inactive-slug>` | Filter ignored |

## Pagination

- Page size: **12**
- Database-level `countDocuments` + `skip`/`limit`
- Invalid page / page `< 1` → `1`
- Page above `totalPages` → clamp to last valid page
- `total === 0` → `page = 1`, `totalPages = 0`

Default sort: `nameHe` ascending (unchanged from Demo 6). No public sort UI.

## Filter Builder (Pure)

[`buildProductCatalogFilter()`](../src/lib/catalog/build-product-catalog-filter.ts) is a **pure function**:

- Input: `{ query?, categoryId? }`
- Output: MongoDB filter object
- No database access

Slug resolution stays in `resolveActiveCategorySlug()` inside the data-access layer.

## Index Decision

Added to Product model:

```ts
productSchema.index({ isActive: 1, categoryId: 1 });
```

Existing indexes on `slug`, `sku`, `categoryId`, `isActive` remain. No speculative search/text indexes added.

## UI

All Server Components — no client fetching:

- [`CatalogSearchForm`](../src/components/catalog/CatalogSearchForm.tsx) — `<form method="get">`
- [`CatalogCategoryFilter`](../src/components/catalog/CatalogCategoryFilter.tsx) — horizontal links/chips, scroll on mobile
- [`CatalogPagination`](../src/components/catalog/CatalogPagination.tsx) — prev/next + compact page numbers
- [`CatalogResultSummary`](../src/components/catalog/CatalogResultSummary.tsx) — `"24 מוצרים"` / `"24 תוצאות"`

Premium editorial styling — not a SaaS filter panel.

## Empty States

| Condition | Message |
|-----------|---------|
| No active products, no filters | `"עדיין לא נוספו מוצרים לקטלוג."` |
| Filters applied, zero results | `"לא נמצאו מוצרים שמתאימים לחיפוש."` + link to `/products` |

## Accessibility

- Search: semantic GET form + labeled input
- Categories: `<nav>` with `aria-current` on active filter
- Pagination: `<nav aria-label="עמודים">`, `aria-current="page"` on current page
- Disabled prev/next use `<span aria-disabled="true">`, not misleading links

## Admin

No Admin changes in Demo 7B.

## Deferred

- Advanced filters (materials, dimensions, availability)
- Sorting UI
- Atlas Search / Elasticsearch / Algolia / autocomplete
- Infinite scroll, page-size selection
- Admin catalog search
- Public category landing pages
- Header category navigation

See [`docs/project-foundation.md`](project-foundation.md).
