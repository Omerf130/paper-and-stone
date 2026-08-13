# Demo 11C — Admin Lists + Tables + Forms

## Scope

Visual/UX migration of Admin management list pages and standard CRUD forms to the 11A/11B design language. No business logic, route, or query semantics changes.

**In scope:** 6 list pages, Category/Material/Color forms, form page shells, Product list, ProductForm submit button only.

**Out of scope:** Project detail, Product media/recolor/mask, full ProductForm field migration.

## List Architecture

```
AdminPage (width="wide")
  AdminPageHeader
  [EntityToolbar — users/projects only]
  Desktop table (shared admin-table.module.scss)
  Mobile cards (shared admin-list-card.module.scss)
  AdminPagination (users/projects)
  EmptyState
```

Shared SCSS primitives — not a generic Table component. Entity-specific semantic markup remains in page files.

## Responsive Breakpoints (content-density based)

| Entity | Table from | Cards below |
|--------|------------|-------------|
| Categories | 768px (`tablet-up`) | mobile |
| Products, Materials, Colors, Users, Projects | 1024px (`desktop-up`) | mobile + tablet |

No horizontal scroll as default mobile UX.

Layout helpers: `admin-list-layout.module.scss`
- `.desktopOnlyTablet` / `.mobileOnlyTablet` — categories
- `.desktopOnlyDesktop` / `.mobileOnlyDesktop` — wide lists

## StatusBadge Migration

- `mapEntityActiveToBadge` — active/inactive entities
- `mapProductFeaturedToBadge` — product featured flag
- `mapProjectStatusToBadge` — project workflow statuses

Removed: `AdminStatusBadge`

## Forms

| Form | Migration |
|------|-----------|
| CategoryForm | Already 11A; page shell + ghost cancel Button |
| MaterialForm | FormField, Toast, Button |
| ColorForm | FormField, Toast, Button |
| ProductForm | Submit Button loading only; fields unchanged |

Form pages use `AdminPage width="form"` (48rem). Product edit `[id]` uses `width="wide"` for media sections.

## ConfirmDialog

Migrated in `UserRowActions`: admin promotion, user deactivation.

Deferred: `ProductMediaManager` (11D).

## Utilities

- `formatDateTime()` in `src/lib/ui/format-date-time.ts`

## Legacy Removed

- `AdminStatusBadge`
- Per-page header/createLink SCSS on list pages
- Duplicate toolbar/pagination SCSS modules

## Deferred (11D)

- Project detail redesign
- Product media/recolor/mask UI
- Full ProductForm FormField migration
- ProductMediaManager ConfirmDialog
