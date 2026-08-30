# Phase 19A — Public Product Detail UX V2

## Audit Summary

The public PDP at `/products/[slug]` previously stacked a large hero, a full-width `TechnicalInfo` section, and `ProductDescription`. Media placeholders used 16–24rem min-heights with no max-height cap. Preview-only wishlist/download buttons existed without persistence. No product document download field existed; `technicalDrawing` is presentation media only.

## Layout Changes

- Hero remains a 62/38 desktop split via `ProductHero`.
- Aside now renders `ProductInfo` + `ProductDetailAside` with tabs and header actions.
- Standalone below-fold `TechnicalInfo` removed; technical content lives in the **מידע טכני** tab panel.
- `ProductDescription` remains below the hero (unique editorial content).

## Image Sizing

- `ProductMedia` stage uses `max-height: clamp(12rem, 32vh, 22rem)` (up to 24rem on desktop).
- `ProductVisual` / `TechnicalDrawing` min-heights reduced to 12/14/16rem.
- Hero padding and grid gaps tightened for denser above-the-fold layout.

## Tabs

- Accessible `Tabs` primitive (`role="tablist"`, keyboard navigation, RTL-aware arrow handling).
- **פרטי מוצר** — configurator controls and add-to-project actions.
- **מידע טכני** — embedded `TechnicalInfo` (shown only when data exists).
- Optional deep link: `?tab=technical`.
- Both panels remain server-rendered in DOM; inactive panel uses `hidden`.

## Product Documents (Downloads)

New Product field:

```ts
documents: [{ label, url, fileType?, sortOrder, createdAt }]
```

- Public mapper exposes only `{ id, label, url, fileType? }`.
- `technicalDrawing`, gallery, and primary image are never download sources.
- Admin form includes minimal `DocumentsEditor` (label/url/fileType rows).
- Download icon hidden when `documents.length === 0`.
- One document → direct link; multiple → compact menu.

## Wishlist

- New `WishlistItem` collection (`userId`, `productSlug`, unique compound index).
- PDP heart toggles persistence for authenticated users; guests redirect to login with `next`.
- New `/wishlist` page lists saved products using catalog-style cards + remove action.
- Guest `/wishlist` redirects to login with safe `next=/wishlist`.
- Header account menu includes **מועדפים** link for signed-in users.

## Responsive Behavior

| Breakpoint | Notes |
|------------|-------|
| 1440px | Compact media, tabs + actions visible with identity |
| 1024px | Same grid; sticky aside when content fits |
| 768px | Stacked layout; horizontal tab scroll if needed |
| 375px | Identity → media → tabs; 44px icon targets |

## SEO / Accessibility

- Metadata unchanged (title + description).
- Technical content remains in initial HTML inside tab panels.
- Tabs use ARIA tab semantics; icon buttons have `aria-label` and native `title`.
- SKU values remain LTR where applicable.

## Phase 19B Prerequisites

- Admin document upload (file storage, MIME validation beyond URL entry)
- Richer wishlist UX if needed (sorting, bulk actions)
- JSON-LD Product schema (optional SEO enhancement)

## Verification

```bash
npm run lint
npm run test
npm run build
```

Manual QA at 1440 / 1024 / 768 / 375: compact fold, tab switch without scroll, wishlist auth flow, download only with documents, no duplicate technical section, configurator + add-to-project unchanged.
