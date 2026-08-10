# Demo 5B — Admin Shell + Product Management CRUD

Protected admin area with product list, create, edit, and status management. MongoDB remains the single source of truth for public and admin views.

## Scope

Implemented:

- Route group split: public shell vs admin shell
- Server-protected `/admin` area via `requireAdmin()`
- Admin dashboard with real MongoDB counts
- Product list, create, edit
- Reusable `ProductForm` with embedded fabrics/colors/sizes editors
- Zod validation + whitelisted mutations
- Admin `"ניהול"` link on public Header (admin only)

**Not implemented:** dynamic public catalog, image uploads, category CRUD, delete, users, projects, pricing.

## Route Architecture

```
src/app/
  layout.tsx                 # minimal root (html/body/globals)
  (public)/
    layout.tsx               # Header + main + Footer
    page.tsx                 # /
    login/, register/, products/milano-sofa/
  admin/
    layout.tsx               # requireAdmin() + AdminShell
    page.tsx                 # dashboard
    products/
      page.tsx               # list
      new/page.tsx           # create
      [id]/page.tsx          # edit
```

Public URLs unchanged. `/admin` does not render public Header/Footer.

## Authorization

**Layout boundary:** [`src/app/admin/layout.tsx`](../src/app/admin/layout.tsx) calls `requireAdmin()`.

**Mutation boundary:** [`src/app/admin/products/actions.ts`](../src/app/admin/products/actions.ts) calls `requireAdmin()` in every Server Action.

| Actor | `/admin` access |
|-------|-----------------|
| Unauthenticated | redirect `/login` |
| customer / professional | redirect `/` |
| admin | allowed |

Navigation visibility is not used for security.

## Admin Shell

Components under [`src/components/admin/`](../src/components/admin/):

- `AdminShell` — sidebar + top bar + content
- `AdminSidebar` — desktop nav (ראשי, מוצרים)
- `AdminMobileNav` — mobile drawer
- Logout reuses existing `logoutAction`
- Link back to public site (`/`)

Design: professional, minimal, RTL, consistent with Paper & Stone tokens.

## Dashboard

Route: `/admin`

Real counts from MongoDB via `getAdminDashboardStats()`:

- total products
- active products
- featured products
- active categories

Primary CTA: **ניהול מוצרים** → `/admin/products`

## Product List

Route: `/admin/products`

`getAdminProducts()` — all products (active + inactive), populated category, sorted by `updatedAt` desc.

Columns: name, SKU, category, active, featured, updated, edit link.

No pagination/search/filters in Demo 5B.

## Product CRUD Architecture

```
Server page
  → fetch categories / product
  → ProductForm (client)
  → createProductAction / updateProductAction
  → requireAdmin()
  → Zod productInputSchema
  → mapProductInputToWriteFields()
  → createProduct() / updateProduct()
  → MongoDB
```

### Data access ([`src/lib/products/`](../src/lib/products/))

| Function | Purpose |
|----------|---------|
| `getActiveCategories()` | Category select + server verification |
| `getAdminDashboardStats()` | Dashboard counts |
| `getAdminProducts()` | Admin list |
| `getAdminProductById(id)` | Edit form data |
| `createProduct(fields)` | Whitelisted insert |
| `updateProduct(id, fields)` | Whitelisted update |

## ProductForm

Reusable client component: [`src/components/admin/ProductForm/ProductForm.tsx`](../src/components/admin/ProductForm/ProductForm.tsx)

Sub-editors:

- `MaterialsEditor` — string list
- `FabricsEditor` — fabrics + nested colors
- `SizesEditor` — size options

Sections: מידע בסיסי, תוכן, מידות, מידע טכני, בדים וצבעים, מידות לבחירה, סטטוס.

## Internal Configuration Keys

`key` fields for fabrics, colors, and sizes are **internal stable identifiers**:

- Auto-generated when item is created ([`src/lib/products/config-keys.ts`](../src/lib/products/config-keys.ts))
- Not exposed as editable form fields
- Label changes do **not** change existing keys
- Collision-safe within the product (suffix `-2`, `-3`, …)
- No UUID packages

This is transitional until a Material/Fabric library exists.

## visualTone (temporary)

Color `visualTone` select uses demo tones from [`src/types/product.ts`](../src/types/product.ts):

`blue`, `mustard`, `gray`, `natural`, `stone`, `sage`

Used only for SVG demo visualization — not final 2D/material architecture.

## Validation

[`src/lib/products/product-validation.ts`](../src/lib/products/product-validation.ts):

- Zod schema for all product fields
- Slug format: lowercase alphanumeric + hyphens
- Positive dimensions when provided
- Category ObjectId required
- Server verifies category exists and is active before write

**Duplicate errors (Hebrew):**

- slug → `"כבר קיים מוצר עם כתובת זו"`
- sku → `"כבר קיים מוצר עם מק״ט זה"`

## Mutation Security

- `requireAdmin()` on every mutation
- Explicit field whitelist via `mapProductInputToWriteFields()`
- No arbitrary client payload passed to Mongoose
- Category existence verified server-side

## Activate / Deactivate

- `isActive` controlled via edit form checkbox
- Inactive products remain in admin list
- Public [`getProductBySlug()`](../src/lib/products/getProductBySlug.ts) filters `isActive: true` → public Milano page 404 when inactive
- No hard delete

## Featured

- `isFeatured` stored via edit form
- Homepage Featured Products **not** migrated to MongoDB in this phase

## Public Product Route

`/products/milano-sofa` remains a fixed demo route (not `[slug]`).

Admin may create additional products visible in admin only until a later catalog phase.

## Tests

Run: `npm run test`

- Product validation + whitelist mapping
- Duplicate error mapping
- Config key generation
- Inactive product exclusion in `getProductBySlug`
- Admin actions call `requireAdmin()`

## Deferred

- Dynamic public `/products/[slug]`
- Product deletion
- Image/CAD uploads
- Category management UI
- Materials library
- Homepage DB featured products
- Search, filters, pagination
- Users, projects, pricing, notifications
