# Demo 12 — Public Product Page Redesign

Editorial redesign of the public product detail page (`/products/[slug]`). Presentation-only — no schema, query, configurator logic, recolor algorithm, or project workflow changes.

## Goals

- Image-first desktop hero (62/38 split)
- Single-column tablet; identity-first mobile ordering
- Shared configurator state with split presentation components
- Progressive sticky config rail on desktop (only when content fits viewport)
- Editorial identity, configuration, and lower-page sections

## Architecture

```
page.tsx (Server)
  └── ProductConfigurator (Client orchestrator)
        ├── useProductConfiguratorState(product)  ← single source of truth
        ├── ProductHero (layout + conditional sticky)
        │     ├── ProductMedia (props from state)
        │     └── ProductConfiguratorControls (props from state)
        └── identity slot: ProductInfo (Server)
```

Material/color selection → selected HEX → `ProductRecolorCanvas` remains wired through shared hook state passed into `ProductMedia`.

## New Components

| Component | Role |
|-----------|------|
| `ProductHero` | Responsive grid; `display: contents` mobile reorder; desktop sticky rail |
| `ProductMedia` | View switch, hero visual/recolor, horizontal gallery |
| `ProductConfiguratorControls` | Material → color hierarchy, size (multi only), quantity, summary, actions |
| `ProductMetaList` | Brand/designer meta rows |
| `ProductOptionGroup` | Reusable material/size button groups |

## New Helpers

| Helper | Role |
|--------|------|
| `useProductConfiguratorState` | Extracted client state (material, color, size, quantity, view, gallery, dialog) |
| `getProductPageSections` | Section visibility flags (gallery, drawing switch, size selector, etc.) |
| `formatProductSelectionSummary` | Slim configuration summary rows |
| `useStickyWhenFits` | Desktop-only sticky when aside height ≤ viewport |

## Layout

- **Desktop (≥1024px):** 62% media column | 38% identity + config rail
- **Tablet (768–1023px):** Single column — identity → media → config
- **Mobile (<768px):** Same order; horizontal scroll gallery thumbnails

## Sticky Config Rail

- Progressive enhancement only
- No nested `overflow-y: auto` on config rail
- Sticky applied only when full identity + config block fits within usable viewport height
- Falls back to normal document flow when content is taller

## Container

- `Container` gains `variant="wide"` using `$product-hero-max-width` (90rem)
- Hero section uses wide container; lower sections (`TechnicalInfo`, `ProductDescription`) align to same width

## Presentation Changes

- Hide size selector when product has only one size (state still set)
- Slim configuration summary (no product name row; no “הבחירה שלך” title)
- Recolor hint under hero when active (color name + swatch)
- Fixed primary “הוספה לפרויקט” button styling (was functional but looked disabled)
- `AddToProjectDialog` visual polish (panel, header divider, label styling)

## Unchanged

- All MongoDB queries on product page
- `getConfiguratorState`, `shouldShowRecolorForImage`, recolor canvas
- Add-to-project action and dialog behavior
- Preview-only favorites / spec download buttons
- Catalog, homepage, header, footer

## Files

**Added:** `ProductHero/*`, `ProductMedia/*`, `ProductConfiguratorControls/*`, `ProductMetaList/*`, `ProductOptionGroup/*`, `useProductConfiguratorState.ts`, `get-product-page-sections.ts`, `format-product-selection-summary.ts`, tests

**Modified:** `page.tsx`, `ProductConfigurator.tsx`, `ProductInfo/*`, `TechnicalInfo/*`, `ProductDescription/*`, `AddToProjectDialog.module.scss`, `Container/*`, `_tokens.scss`

**Removed:** `ProductConfigurator.module.scss` (styles split into child modules)

## Verification

Run `npm run lint`, `npm test`, `npm run build`.

Manual checklist at 375 / 768 / 1024 / 1440px — see implementation report.
