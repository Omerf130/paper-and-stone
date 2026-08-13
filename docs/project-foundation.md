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

**Demo 7A:**
- Admin category list, create, edit at `/admin/categories`
- Reusable `CategoryForm` with Zod validation + whitelisted mutations
- Flat categories only (no hierarchy)
- Product count via aggregation (all products, not just active)
- Deactivate/reactivate without modifying products
- ProductForm inactive-category edit compatibility
- Admin nav: ראשי, מוצרים, קטגוריות
- No hard delete, no public category pages

**Demo 7B:**
- Public catalog search, category filter, pagination at `/products`
- URL-driven state (`q`, `category`, `page`)
- Server-side regex search with escaped input
- Active category filter by slug; invalid/inactive slug ignored
- Database pagination (12 per page, skip/limit)
- Pure `buildProductCatalogFilter()` + separate slug resolution
- Compound index `{ isActive: 1, categoryId: 1 }`

**Demo 8A:**
- Embedded `Product.media` schema (primaryImage, gallery, technicalDrawing)
- Provider-agnostic `MediaStorageProvider` interface (no implementation)
- Public `PublicImageView` serialization; storageKey never exposed to client
- Catalog/product fallbacks when media is absent

**Demo 8B:**
- Vercel Blob client upload + protected `handleUpload` route
- Admin `ProductMediaManager` on product edit page
- Primary/gallery/technical upload, replace, delete, gallery reorder, alt text
- Token-based MIME/size enforcement (`allowedContentTypes`, `maximumSizeInBytes`)
- Server Actions for non-upload mutations (delete, reorder, alt)
- Public gallery thumbnail strip on product page
- `next/image` remotePatterns for Blob CDN hostname

**Demo 9A:**
- Central `Color` and `Material` MongoDB collections (Option B)
- Material `colorIds[]` refs central Color ObjectIds
- Admin CRUD at `/admin/colors` and `/admin/materials`
- HEX normalization, optional normalized unique `code`, MaterialType enum
- Server-enforced inactive-color rules on Material create/update
- `Product.materials: string[]` remains legacy spec text (not the library)
- Legacy `Product.fabrics[]` unchanged until Demo 9B

**Demo 9B:**
- `Product.materialOptions[]` connects products to central Material/Color library
- Admin `MaterialOptionsEditor` replaces legacy `FabricsEditor`
- Public configurator uses library-backed `materialOptions` with HEX swatches
- Legacy `fabrics[]` read-only fallback when `materialOptions` is empty
- Idempotent demo seed for Milano (Colors/Materials via `$setOnInsert`)

**Demo 9C.1:**
- Product-specific PNG recolor mask on Vercel Blob
- `recolorConfig` binds mask to primary image via `sourceImageMediaId`
- Browser-side luminance-preserving Canvas recolor using `Color.hex`
- Admin `ProductRecolorManager` with preview + enable/disable
- Public `ProductRecolorCanvas` with graceful fallback to `ProductImage`

**Demo 9C.2:**
- Admin `ProductMaskEditor` — in-browser paint/erase/fill mask creator
- Natural-resolution PNG export via existing `recolor-mask` upload pipeline
- Memory-aware undo/redo (alpha snapshots, 64 MB combined budget, max 12 states)
- Existing mask editing when `status === "ready"`; blank mask on `invalid_source`
- Manual PNG upload retained as secondary fallback

**Demo 10A:**
- Admin `/admin/users` — list, search, role/status filters, pagination
- Role management (customer / professional / admin)
- Activate/deactivate users with session invalidation on deactivation
- Self-protection and last-active-admin guards
- Desktop table + mobile user cards

**Demo 10B:**
- Protected `/professional` area for `role: "professional"` users
- `ProfessionalProfile` model (1:1 with User via unique `userId`)
- Race-safe lazy profile creation via atomic `$setOnInsert` upsert
- Dashboard with profile completeness summary
- Self-edit at `/professional/profile`
- `ProfessionalShell` with sidebar + mobile nav (ראשי, הפרופיל שלי)
- Header entry: "אזור מקצועי" in `HeaderAccount` + `MobileMenu` (not homepage CTA)
- Profile retained on role demotion; access lost until re-promoted

**Demo 10C:**
- `Project` model with embedded `items[]` (references + minimal snapshot)
- Professional routes: `/professional/projects`, `/new`, `/[id]`
- Draft-only project CRUD; status enum prepared for future workflow
- Add/update/remove configured product items with server-side validation
- Duplicate configuration increments quantity (max 999, reject overflow)
- Product page "הוספה לפרויקט" for professionals via native dialog
- Profile readiness gate: fullName + phone required before project actions
- Nav: **הפרויקטים שלי**

**Demo 10E.1 — Notification Foundation:**
- Separate `Notification` collection for Professional inbox
- Workflow hooks on admin approve / reject / request changes
- `/professional/notifications` with pagination and mark-read actions
- Admin submitted-queue badge (not Notification records)
- `reviewHistory` remains immutable workflow audit

**Demo 10E.2 — Project Messaging:**
- Separate `ProjectMessage` collection for per-project conversation
- Thread UI on Professional and Admin project detail pages (`#messages`)
- `readByUserIds[]` per-user read state; sender seeded on create
- Admin → Professional `PROJECT_MESSAGE` notification; Pro → Admin via list badges only
- Messaging available after first submission (`hasEverBeenSubmitted`)

**Demo 11A — Design System + Feedback Foundation:**
- Shared internal UI primitives under `src/components/ui/` (Button, Toast, ConfirmDialog, FeedbackBanner, StatusBadge, FormField, EmptyState)
- ToastProvider scoped to Admin + Professional layouts
- Representative flow migrations: project submit, admin approve/reject, message send, category save
- No business logic changes; public site unchanged

**Demo 11B — Admin Shell + Dashboard Redesign:**
- Editorial admin shell: grouped sidebar nav, brand block, minimal topbar
- Shared `AdminPage` / `AdminPageHeader` page container primitives
- Dashboard: attention area (submitted projects + unread messages), typography metrics, quick actions, recent projects
- Dashboard data via `getAdminDashboardData` (page-specific); layout keeps submitted-project nav badge only
- No list/form/detail page redesign (11C/11D)

**Demo 11C — Admin Lists + Tables + Forms:**
- All 6 admin list pages migrated to shared table/card language + `AdminPageHeader`
- Content-density responsive breakpoints (categories at 768px; wide lists at 1024px)
- `StatusBadge` + mappers replace `AdminStatusBadge`
- `EmptyState`, unified `AdminPagination`, shared toolbar SCSS
- Material/Color forms: FormField, Toast, Button; form page shells
- ProductForm: submit Button only; Product edit shell only
- `UserRowActions`: ConfirmDialog + toast

See also: [`docs/demo-1-public-shell.md`](demo-1-public-shell.md), [`docs/demo-2-homepage.md`](demo-2-homepage.md), [`docs/demo-3-product-page.md`](demo-3-product-page.md), [`docs/demo-4-mongodb-product-foundation.md`](demo-4-mongodb-product-foundation.md), [`docs/demo-5a-authentication.md`](demo-5a-authentication.md), [`docs/demo-5b-admin-products.md`](demo-5b-admin-products.md), [`docs/demo-6-public-catalog.md`](demo-6-public-catalog.md), [`docs/demo-7a-category-management.md`](demo-7a-category-management.md), [`docs/demo-7b-catalog-search-filter-pagination.md`](demo-7b-catalog-search-filter-pagination.md), [`docs/demo-8a-product-media-foundation.md`](demo-8a-product-media-foundation.md), [`docs/demo-8b-vercel-blob-media-manager.md`](demo-8b-vercel-blob-media-manager.md), [`docs/demo-9a-material-color-library.md`](demo-9a-material-color-library.md), [`docs/demo-9b-product-material-assignment.md`](demo-9b-product-material-assignment.md), [`docs/demo-9c1-product-recolor-foundation.md`](demo-9c1-product-recolor-foundation.md), [`docs/demo-9c2-admin-mask-creator.md`](demo-9c2-admin-mask-creator.md), [`docs/demo-10a-admin-users-management.md`](demo-10a-admin-users-management.md), [`docs/demo-10b-professional-area.md`](demo-10b-professional-area.md), [`docs/demo-10c-project-foundation.md`](demo-10c-project-foundation.md), [`docs/demo-10d-project-submission-admin-review.md`](demo-10d-project-submission-admin-review.md), [`docs/demo-10e1-notifications.md`](demo-10e1-notifications.md), [`docs/demo-10e2-project-messaging.md`](demo-10e2-project-messaging.md), [`docs/demo-11a-design-system-feedback-foundation.md`](demo-11a-design-system-feedback-foundation.md), [`docs/demo-11b-admin-shell-dashboard-redesign.md`](demo-11b-admin-shell-dashboard-redesign.md), [`docs/demo-11c-admin-lists-forms-redesign.md`](demo-11c-admin-lists-forms-redesign.md)

## Intentionally Deferred

The following are planned for future phases — not blockers for the foundation:

- Dynamic public catalog routes
- Catalog search, filters, pagination
- Customer and professional accounts (Demo 10B: professional area + profile foundation)
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
- **File / image storage** — Vercel Blob for product media (Demo 8B); fabric/color variant media deferred
- **English / i18n** — translation system, locale routing, content management
- **External integrations** — Programa, ERP/CRM, notification channels
