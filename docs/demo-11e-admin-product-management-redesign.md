# Demo 11E — Admin Product Management Redesign

## Scope

Visual/UX migration of admin product create (`/admin/products/new`) and edit (`/admin/products/[id]`) to the 11A/11B/11C/11D design language. No schema, query, workflow, media upload, recolor algorithm, or public product page changes.

**In scope:** ProductForm section architecture, material/color/size editors, edit page shell (header, anchor nav, media/recolor sections), ProductMediaManager, ProductRecolorManager, ProductMaskEditor toolbar polish, sticky save on edit, Toast/ConfirmDialog migration, helpers + tests, documentation.

**Out of scope:** Public product page, catalog, new dependencies, backend changes.

## Page Architecture

### Create (`/admin/products/new`)

```
AdminPage (width="wide")
  AdminPageHeader — "מוצר חדש"
  ProductForm (mode="create")
    #product-identity — פרטי מוצר
    #product-content — תוכן
    #product-config — תצורת מוצר
    #product-spec — מידות ומפרט
    footer: Button "יצירת מוצר" + cancel link
```

### Edit (`/admin/products/[id]`)

```
AdminPage (width="wide")
  AdminPageHeader — product.nameHe, StatusBadge meta strip, back action
  AdminProductSectionNav — anchor links to sections
  ProductForm (mode="edit")
    #product-identity … #product-spec (same as create)
    AdminDetailSection#product-media → ProductMediaManager (hideTitle)
    AdminDetailSection#product-recolor → ProductRecolorManager (hideTitle)
    ProductEditStickySave — single sticky save bar (no footer duplicate)
```

Reading order: **identity → content → configurator inputs → spec → media → recolor → save**.

## Save Behavior

| Mode | Primary save | Pending state |
|------|--------------|---------------|
| Create | Bottom `Button` in ProductForm | Shared `useTransition` |
| Edit | `ProductEditStickySave` only | Via `ProductFormActionsContext` |

Single `handleSubmit`, single Server Action (`createProductAction` / `updateProductAction`). Success uses Toast; `?saved=1` redirects are stripped via `router.replace` with toast.

## Information Hierarchy

| Section | Content |
|---------|---------|
| פרטי מוצר | Names, slug, SKU, category, brand, designer, isActive/isFeatured |
| תוכן | Short/long descriptions |
| תצורת מוצר | MaterialOptionsEditor + SizesEditor |
| מידות ומפרט | Dimensions, free-text materials, maintenance/warranty/origin |
| מדיה (edit) | Primary, gallery, technical images |
| צביעה אוטומטית (edit) | Workflow status, mask upload/editor, preview |

## Feedback Migration

- Inline success banners removed; Toast on save/upload/delete success
- Destructive deletes: ConfirmDialog (media gallery/technical, recolor mask)
- Recolor status: `FeedbackBanner` + `mapRecolorStatusPresentation` helper
- Field validation errors remain inline via `FormField`

## Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| 375px | Single column fields; sticky save full width |
| 768px | 2-column field grid; section nav wraps |
| 1024px+ | Wide AdminPage; media gallery rows with top dividers |
| 1440px+ | Same readable column; mask editor toolbar groups wrap |

## Accessibility

- Section `<h2>` via `ProductFormSection` / `AdminDetailSection`
- Anchor nav with `scroll-margin-top` on sections
- Status text via `StatusBadge` and `FeedbackBanner`
- Mask editor toolbar: `role="toolbar"`, `aria-pressed` on mode/tool buttons
- Form labels/errors via `FormField`

## Server / Client Boundaries

| Component | Type |
|-----------|------|
| `products/[id]/page.tsx`, `products/new/page.tsx` | Server |
| `ProductForm`, editors, media/recolor/mask managers | Client |
| Server Actions | Unchanged |

## Query Impact

Zero new queries. Same data loaders on edit page load.

## Tests

- `src/lib/media/__tests__/map-recolor-status-presentation.test.ts`

## Deferred After 11E

- Public product page redesign
- Bulk product operations
- Media drag-and-drop reorder UX
- Advanced recolor batch tools
