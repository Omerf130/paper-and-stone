# Paper & Stone — Project Foundation

Demo 0 establishes the technical and visual baseline for incremental development.

## Current Stack

- **Next.js 16** — App Router, Server Components by default
- **TypeScript** — strict mode enabled
- **SCSS** — global styles + SCSS Modules for component/page styles
- **ESLint** — Next.js recommended config
- **MongoDB / Mongoose** — product data (Demo 4+)
- **bcrypt / Zod** — password hashing and server-side validation (Demo 5A+)

Authentication uses first-party opaque sessions (no NextAuth/JWT). UI framework libraries are not installed.

## Folder Structure

```
src/
  app/              # Routes, layouts, pages (App Router)
  components/       # Reusable UI components
  lib/              # DB connection, product data access, auth utilities
  models/           # Mongoose models (Category, Product, User, Session)
  types/            # Serializable view types (ProductView, SafeUser)
  styles/           # Global styles, design tokens, mixins
docs/               # Architecture and project documentation
public/             # Static assets
scripts/            # Development scripts (seed)
```

Future areas (created when first needed):

- `services/` — business logic and external integrations

## Styling Approach

- **Global styles** — `src/styles/globals.scss` (reset, base typography, body defaults)
- **Design tokens** — `src/styles/_tokens.scss` (colors, spacing, typography, layout)
- **Mixins** — `src/styles/_mixins.scss` (minimal responsive breakpoints)
- **Component styles** — co-located `*.module.scss` files scoped via CSS Modules
- **Imports** — relative `@use` paths (no Sass path-alias configuration)

Prefer CSS logical properties (`margin-inline`, `padding-inline`, `text-align: start`) for RTL/LTR compatibility.

## RTL Approach

- Root layout sets `<html lang="he" dir="rtl">`
- Hebrew is the initial UI language
- Full i18n (English/LTR toggle, translation files) is intentionally deferred
- Logical CSS properties prepare the codebase for future bilingual support without structural rewrites

## Current Scope

**Demo 0:**
- Next.js project initialization
- SCSS foundation with design tokens
- Hebrew RTL root configuration
- Reusable `Container` layout utility
- Responsive fundamentals (mobile, tablet, desktop)

**Demo 1:**
- Public shell: Header, Footer, mobile navigation
- Base `Button` and `Section` components
- Shared navigation config (`src/config/navigation.ts`)
- Root layout is minimal; `(public)` layout wraps pages with Header + main + Footer
- Nav items without routes render as non-interactive spans until real pages exist
- Temporary `/` preview page demonstrating the shell (not final homepage)

**Demo 2:**
- Full premium homepage at `/` with 7 editorial sections
- `VisualPlaceholder` component for future photography
- Local typed data in `src/components/home/homepage-data.ts`
- Shared typography mixins in `src/styles/_typography.scss`
- Homepage section components under `src/components/home/`

**Demo 3:**
- Product detail page at `/products/milano-sofa`
- Demo configurator (fabric, color, size, quantity)
- Demo product visual with color-tone switching (NOT final 2D implementation)
- Technical drawing view placeholder

**Demo 4:**
- MongoDB/Mongoose connection with dev cache ([`src/lib/db/mongoose.ts`](../src/lib/db/mongoose.ts))
- Category and Product models
- `getProductBySlug` + `ProductView` serialization
- Milano Sofa page reads from MongoDB (no hardcoded fallback)
- Seed script (`npm run seed`) — upsert by slug
- Removed `demo-product.ts`

**Demo 5A:**
- User and Session models with opaque server-side sessions
- bcrypt password hashing, Zod validation
- `/login`, `/register`, logout via Server Actions
- `getCurrentUser()`, `requireUser()`, `requireAdmin()` helpers
- Header reflects auth state
- Admin seed via `ADMIN_EMAIL` / `ADMIN_PASSWORD` (password not reset on re-seed)
- Unit tests via Vitest (`npm run test`)

**Demo 5B:**
- Route groups: `(public)` shell vs `admin` shell
- Protected `/admin` with `requireAdmin()` at layout + mutations
- Admin dashboard, product list, create, edit
- Reusable `ProductForm` with fabrics/colors/sizes editors
- Whitelisted product mutations + Zod validation
- Admin `"ניהול"` link on public Header (admin only)

**Demo 6:**
- Public catalog at `/products` from MongoDB
- Dynamic product pages at `/products/[slug]`
- Homepage featured products from DB (`isActive + isFeatured`, max 4)
- Optional configuration hardening on product page components
- `CatalogProductView` public serialization type
- `force-dynamic` rendering for catalog, product pages, homepage

See also: [`docs/demo-1-public-shell.md`](demo-1-public-shell.md), [`docs/demo-2-homepage.md`](demo-2-homepage.md), [`docs/demo-3-product-page.md`](demo-3-product-page.md), [`docs/demo-4-mongodb-product-foundation.md`](demo-4-mongodb-product-foundation.md), [`docs/demo-5a-authentication.md`](demo-5a-authentication.md), [`docs/demo-5b-admin-products.md`](demo-5b-admin-products.md), [`docs/demo-6-public-catalog.md`](demo-6-public-catalog.md)

## Intentionally Deferred

The following are planned for future phases — not blockers for the foundation:

- Dynamic public catalog routes
- Catalog search, filters, pagination
- Customer and professional accounts
- Projects, rooms, quotes, pricing workflow
- Notifications, PDF generation
- Search, SEO, Excel import
- English UI / full i18n
- External integrations (Programa, ERP/CRM, WhatsApp, etc.)
- 2D material visualization, 3D/AR

## Major Future Architectural Areas

| Area | Description |
|------|-------------|
| Public website | Premium marketing site, catalog browsing, product detail |
| Catalog | Categories, brands, designers, collections, materials library |
| Accounts | Customer and professional (architect/designer) roles |
| Projects | Rooms, configured products, quote requests |
| Admin | Product management, pricing workflow, order tracking |
| Content | Documents/PDFs, notifications, multi-language support |
| Integrations | External design tools, ERP/CRM, import/export |

## Open Decisions

Unresolved items — not blockers for Demo 0:

- **Final branding** — colors, typography, visual identity
- **Product variation model** — exact structure for configurations and options
- **2D visualization** — approach for material/fabric preview
- **MongoDB schema** — remaining collections, relationships, indexing strategy
- **File / image storage** — hosting provider, CDN, upload workflow
- **English / i18n** — translation system, locale routing, content management
- **External integrations** — Programa, ERP/CRM, notification channels
