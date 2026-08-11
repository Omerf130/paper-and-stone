# Demo 7A — Category Management

Flat category management in the Admin area: list, create, edit, activate/deactivate, sort order, and product dependency counts. No hierarchy, no public category pages, no hard delete.

## Scope

Implemented:

- `/admin/categories` — list with product counts
- `/admin/categories/new` — create
- `/admin/categories/[id]` — edit
- Reusable `CategoryForm`
- Zod validation + whitelisted mutations
- Admin nav: ראשי, מוצרים, **קטגוריות**
- `getProductFormCategoryOptions()` for inactive-category product edit compatibility
- Server-side category rules on product update

**Not implemented:** hierarchy/subcategories, public category URLs, catalog filters, hard delete, drag-and-drop ordering, slug redirects/history/SEO handling.

## Flat Category Strategy

Categories remain a flat collection with no `parentId`, children, or path fields. The existing [`Category`](../src/models/Category.ts) schema is unchanged.

## Admin Routes

```
src/app/admin/categories/
  page.tsx           # list
  new/page.tsx       # create
  [id]/page.tsx      # edit
  actions.ts         # Server Actions
```

Protected by `requireAdmin()` in [`src/app/admin/layout.tsx`](../src/app/admin/layout.tsx) and in every mutation.

## Create / Edit Flow

```
Server page
  → fetch initial category (edit only)
  → CategoryForm (client)
  → Server Action
  → requireAdmin()
  → Zod parseCategoryFormInput()
  → mapCategoryInputToWriteFields()
  → createCategory() / updateCategory()
```

Success behavior mirrors products: create redirects to edit with `?saved=1`; edit shows inline success banner.

## Validation

[`src/lib/categories/category-validation.ts`](../src/lib/categories/category-validation.ts):

| Field | Rules |
|-------|-------|
| `nameHe` | required, max 200 |
| `nameEn` | optional, max 200 |
| `slug` | required, `^[a-z0-9]+(?:-[a-z0-9]+)*$`, max 100, unique |
| `sortOrder` | integer, ≥ 0, default 0 |
| `isActive` | boolean |

Duplicate slug returns: **"כבר קיימת קטגוריה עם כתובת זו"**

## Slug Behavior

Slug is explicitly editable in Admin. Changing `nameHe` / `nameEn` does **not** auto-update slug.

**Future note:** Once public category URLs or URL-based catalog filtering exist (Demo 7B+), slug changes may affect SEO and bookmark compatibility. Redirects, slug history, and SEO handling are intentionally deferred.

## Sort Order

Numeric `sortOrder` field (integer ≥ 0). Admin list sorts by `sortOrder ASC`, then `nameHe ASC`. No drag-and-drop UI.

## Active / Inactive

Deactivating a category:

- Sets `isActive: false` on the Category document only
- Does **not** modify, deactivate, or rewrite any Product documents
- Category remains visible in Admin list
- Category hidden from new-product category select and active-only selectors

Reactivating restores visibility in active selectors.

## Category / Product Relationship

Products reference categories via `categoryId`. Inactive categories may still be referenced by existing products.

### ProductForm compatibility

| Scenario | Behavior |
|----------|----------|
| Create product | Only active categories in select |
| Edit product, active category | Normal |
| Edit product, inactive category | Current category shown as `"שם (לא פעיל)"`; save without changing category allowed |
| Edit product, switch category | New category must be active |

### Server-side enforcement

[`verifyCategoryForProductUpdate()`](../src/lib/categories/verifyCategoryForProductUpdate.ts):

- **Unchanged `categoryId`:** category must exist (active or inactive)
- **Changed `categoryId`:** new category must exist and be active

Create product still requires an active category via `verifyActiveCategory()`.

## Product Count

[`getAdminCategories()`](../src/lib/categories/getAdminCategories.ts) uses a single Product aggregation:

```js
{ $group: { _id: "$categoryId", count: { $sum: 1 } } }
```

Counts **all** products referencing the category (active and inactive). No `isActive` filter on the aggregation.

## No Hard Delete

Demo 7A uses deactivation only. No delete button, no delete Server Action. Hard delete and product reassignment behavior are deferred until a dedicated design phase.

## Deferred

- Category hierarchy / subcategories
- Public category pages (`/products/category/[slug]`)
- Catalog category filters and search
- Pagination on category list
- Drag-and-drop sort order
- Hard delete + reassignment workflow
- Slug redirects, slug history, SEO handling
- Category images

See [`docs/project-foundation.md`](project-foundation.md) for overall architecture.
