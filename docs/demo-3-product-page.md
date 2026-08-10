# Demo 3 — Product Detail Page + Demo Configurator

Demo 3 adds a polished product page at `/products/milano-sofa` with a working demo configurator.

## Product Page Structure

| Section | Component | Type |
|---------|-----------|------|
| Top area | `ProductConfigurator` + `ProductInfo` | Client + Server (siblings on page) |
| Technical info | `TechnicalInfo` | Server |
| Description | `ProductDescription` | Server |

Supporting components (used inside configurator):

- `ProductVisual` — demo SVG sofa with color-tone switching
- `TechnicalDrawing` — SVG line-art with dimension labels

## Demo Product Data Strategy

Local typed data in [`src/components/product/demo-product.ts`](../src/components/product/demo-product.ts):

- **NOT** the final MongoDB product schema
- Contains Milano Sofa specs, fabrics, colors, sizes, dimensions, materials
- Helper functions: `getFabricById`, `getColorById`, `resolveValidColorId`

## Server / Client Boundary

- **Server:** `page.tsx`, `ProductInfo`, `TechnicalInfo`, `ProductDescription`
- **Client:** `ProductConfigurator` only (`"use client"`)

Page layout places `ProductInfo` as a sibling outside the configurator — no Server-as-children-to-Client pattern.

```
page.tsx (server)
├── Section
│   └── top grid
│       ├── ProductConfigurator (client) — visual + controls
│       └── ProductInfo (server)
├── TechnicalInfo (server)
└── ProductDescription (server)
```

## Configurator State

```ts
{ view, fabricId, colorId, sizeId, quantity }
```

- **Fabric → Color dependency:** changing fabric auto-resets color if invalid for new fabric
- **View switch:** מוצר / שרטוט ומידות (`aria-pressed`)
- **Quantity:** min 1, +/- buttons with accessible labels
- **Summary:** live-updating selection block, no price

## Demo Visual Color Change

`ProductVisual` uses an abstract SVG sofa silhouette. Color tones map to internal CSS classes (`.toneBlue`, etc.) — hex values in SCSS only, never shown in UI.

**This is NOT the final 2D variant rendering implementation.** It will be replaced by actual variant imagery or the chosen production 2D strategy.

## Technical Drawing Placeholder

`TechnicalDrawing` renders SVG line-art with dimension labels from demo product data. Not engineering-accurate CAD — a clean placeholder for the שרטוט ומידות view.

## Primary Actions

| Action | Treatment |
|--------|-----------|
| הוספה לפרויקט | Native `disabled` button, primary styling, no handler |
| שמירה למועדפים | `Button preview` |
| הורדת מפרט טכני | `Button preview` |

## Homepage Link

Only Milano Sofa in Featured Products has `href: "/products/milano-sofa"`. Other products remain non-interactive.

## What Will Be Replaced Later

1. `demo-product.ts` → MongoDB/API product data
2. `ProductVisual` → real variant photography or production 2D engine
3. `TechnicalDrawing` → actual technical drawings/CAD assets
4. Disabled primary button → real add-to-project workflow
5. Preview secondary actions → favorites, downloads
6. Static route → dynamic `[slug]` when catalog exists

## Intentionally Deferred

- MongoDB, Mongoose, final Product model
- Product catalog, dynamic routes, admin CRUD
- Authentication, projects, rooms, pricing, quotes
- Real favorites, downloads, PDFs
- Canvas recoloring, texture engine, 3D/AR
- English/i18n, external integrations
