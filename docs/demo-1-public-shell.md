# Demo 1 — Public Shell

Demo 1 adds the shared public-facing shell and strengthens the visual foundation.

## Components Added

| Component | Location | Role |
|-----------|----------|------|
| Header | `src/components/Header/` | Sticky public header with wordmark, desktop nav, search placeholder, account preview |
| MobileMenu | `src/components/Header/MobileMenu.tsx` | Client-side mobile nav toggle and panel (only interactive client component in shell) |
| NavItemDisplay | `src/components/Header/NavItemDisplay.tsx` | Renders nav item as Link (if route exists) or span (preview) |
| Footer | `src/components/Footer/` | Editorial multi-column footer |
| Button | `src/components/Button/` | Primary, secondary, text variants; supports Link, button, or preview span |
| Section | `src/components/Section/` | Consistent vertical spacing with optional Container |

Shared navigation config: `src/config/navigation.ts`

## Visual Direction

- Premium, architectural, minimal, editorial
- White/off-white backgrounds, near-black text, neutral grays
- Large editorial headings, restrained body copy, generous whitespace
- Thin borders, minimal border radius, no gradients or glassmorphism
- Temporary bronze/stone accent (`$color-accent`) used sparingly
- Text wordmark "Paper & Stone" — easy to replace with final logo

## Temporary Branding

- No final logo — text wordmark only
- No final brand color — existing accent token retained with restrained usage
- Nav items without routes render as non-interactive spans (secondary color)
- Preview CTAs on `/` render as non-interactive styled spans

## Shell Architecture

Root layout wraps all pages:

```
Header → main → Footer
```

This pattern will later split into route groups when admin/auth areas are added.

## Responsive Behavior

- **Mobile (~375px):** compact header, hamburger menu, stacked preview and footer
- **Tablet (~768px):** larger typography, footer grid begins
- **Desktop (~1024px+):** full horizontal nav, side-by-side preview layout, footer columns

## Accessibility

- Semantic `<header>`, `<nav>`, `<footer>`, `<main>` landmarks
- Mobile menu: `aria-expanded`, `aria-controls`, accessible open/close labels
- Escape closes mobile menu; body scroll locked while open; focus returns to toggle on close
- Search button: `aria-label="חיפוש"`
- Visible `:focus-visible` rings on interactive elements
- Unavailable nav items use `<span>` (not fake links) — replaced with real Links when routes exist
- Preview buttons use `aria-hidden` spans inside labeled container

## Intentionally Deferred (Demo 2+)

- Full homepage sections (hero image, categories, featured products)
- Product catalog and product pages
- Real search functionality
- Authentication and account area
- MongoDB, admin panel
- English/i18n system
