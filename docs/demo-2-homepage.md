# Demo 2 — Premium Homepage

Demo 2 replaces the Demo 1 preview page with the first real client-facing homepage.

## Homepage Sections

| Section | Component | Purpose |
|---------|-----------|---------|
| Hero | `HeroSection` | Primary message, editorial layout, sole H1 |
| Categories | `CategoriesSection` | 6 editorial category tiles |
| Featured Products | `FeaturedProductsSection` | 4 products from local data array |
| About | `AboutSection` | Brand story, typography-led |
| Professionals | `ProfessionalsSection` | Architect/designer workflow (01–04) |
| Inspiration | `InspirationSection` | 3 project visuals, editorial grid |
| Contact CTA | `ContactCtaSection` | Closing call-to-action before Footer |

Header and Footer from Demo 1 remain unchanged.

## Temporary Content Strategy

All Hebrew copy and English product/project labels are **temporary demo content** — not final client-approved marketing copy.

Data lives in [`src/components/home/homepage-data.ts`](../src/components/home/homepage-data.ts):

- `categories` — 6 items with layout hints for editorial grid
- `featuredProducts` — 4 items (name, category, optional brand; no price)
- `projects` — 3 items with featured/standard layout hints
- `workflowSteps` — 4 professional workflow steps

No database models, repositories, services, or API routes.

## Image Placeholder Strategy

[`VisualPlaceholder`](../src/components/VisualPlaceholder/VisualPlaceholder.tsx) is intentionally minimal:

- Neutral stone/off-white background
- Subtle 1px border
- Correct aspect ratios via modifier classes
- No text labels, gradients, patterns, or decorative graphics
- `aria-hidden="true"` — decorative only

Future swap: replace `<VisualPlaceholder />` with `<Image />` inside the same wrapper — layouts are built around photography proportions, not placeholder design.

## Component Structure

```
src/components/
  VisualPlaceholder/
  home/
    homepage-data.ts
    HeroSection/
    CategoriesSection/
    FeaturedProductsSection/
    AboutSection/
    ProfessionalsSection/
    InspirationSection/
    ContactCtaSection/
```

Shared typography mixins: [`src/styles/_typography.scss`](../src/styles/_typography.scss)

Homepage sections reuse existing `Section`, `Container`, and `Button` (preview mode for non-functional CTAs).

## Responsive Approach

- **~375px:** stacked layouts, single-column grids, hero visual above text
- **~768px:** 2-column product grid, 2-column workflow steps, larger typography
- **~1024px:** editorial hero asymmetry, category mosaic, inspiration dominant grid
- **~1280px:** featured products in single row (4 columns) when visuals remain substantial

CSS logical properties used throughout. No decorative hover effects on non-interactive preview tiles.

## What Changes When Real Images Arrive

1. Replace `VisualPlaceholder` with `next/image` in each section wrapper
2. Swap `homepage-data.ts` arrays for MongoDB/API data (Featured Products first)
3. Replace preview CTAs (`Button preview`) with real Links
4. Replace category/project `<span>` labels with Links when routes exist
5. Hero photography will define final proportions — layout grid accommodates flexible visual area

## Intentionally Deferred

- Product pages and catalog routes
- MongoDB / Mongoose
- Authentication and professional area
- Real contact form
- Search functionality
- English/i18n
- Scroll animations
- CMS / external image services
