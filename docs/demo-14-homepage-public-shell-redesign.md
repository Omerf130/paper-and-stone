# Demo 14 — Public Homepage + Public Shell Redesign

Premium editorial redesign of `/` and public Header/Footer, aligned with Demo 12–13 public language.

## Final Section Order

1. Hero
2. Categories (editorial, non-navigating)
3. Featured Products (DB, conditional)
4. Brand / About
5. Professionals
6. Inspiration (demo placeholder content)
7. Closing CTA

## ProductCard Variants

| Variant | Used by | Notes |
|---------|---------|-------|
| `default` | Legacy | Unchanged cover + accent hover |
| `featured` | Homepage featured | contain, editorial hover |
| `catalog` | `/products` | **Frozen Demo 13** |

## Categories

- Static `homepage-data.ts` only
- **No** `catalogSlug`, **no** category links in Demo 14
- All six tiles editorial/non-clickable

## CTAs (Real Routes)

| Section | Destinations |
|---------|--------------|
| Hero | `/products`, `/register` |
| Featured | Section link `/products`; tiles → PDP |
| Professionals | `/register`, `/login` |
| Closing | `/products`, `/register` |

## Content Gaps (Replace Before Launch)

- Hero photograph
- 6 category images
- Brand/about image
- Professionals architectural image
- Inspiration project content (marked demo in UI + docs)
- Contact details / `/contact` route
- Footer nav items without routes remain label-only

## Header / Footer

- Stable light sticky header (no transparent scroll)
- `PublicNavItem` with active state (`isActivePublicPath`)
- Footer dark editorial surface; `אזור אישי` → `/login`

## Queries

Unchanged: single `getFeaturedProducts()` on homepage.

## Verification

Run lint, test, build. QA homepage + catalog + product detail + featured/catalog variant isolation.
