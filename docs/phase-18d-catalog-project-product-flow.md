# Phase 18D — Catalog-Based Add Product Flow

Architects add products by browsing the real `/products` catalog instead of a modal picker.

## Contextual Flow (from Project Room)

1. Architect clicks **+ הוספת מוצר** in a room
2. Navigates to `/products?project={projectId}&room={roomId}`
3. Compact banner shows project/room context + **חזרה לפרויקט**
4. Search, category filters, and pagination preserve `project` + `room`
5. Product card → `/products/{slug}?project=…&room=…`
6. Product Detail shows **הוספה לחדר** (context known)
7. Configure → add via existing `addProductToProject` mutation
8. Redirect to `/professional/projects/{id}?room={roomId}&added=1`

## Direct Flow (Product Detail without context)

1. Approved Architect opens public Product Detail
2. **הוספה לפרויקט** opens `AddToProjectDialog` (project + room select)
3. Uses `getArchitectEditableProjectOptions` — includes **approved** active projects per workspace gates
4. On success → navigate to project room (not refresh-only)

## Guest / Client / Pending

| User | Behavior |
|------|----------|
| Guest | **הוספה לפרויקט** → `/login?next={productUrl}` (+ register link) |
| Client | Info: "הוספה לפרויקט זמינה לאדריכלים" — no add controls |
| Pending/rejected (18C) | No architect add UI |
| Admin browsing | Normal public catalog |

## URL Parameters

| Param | Purpose |
|-------|---------|
| `q` | Search query |
| `category` | Category slug |
| `page` | Pagination |
| `project` | Project context (navigation only) |
| `room` | Room context (navigation only) |

Context params are **not** trusted for authorization. Names appear only after server validation via `getArchitectCatalogProjectContext`.

## Catalog Search (Checkpoint C — scalability)

When `q` is set, ranking runs in **MongoDB aggregation** (not unbounded in-memory):

| Rank | Match |
|------|-------|
| 0 | Exact `skuNormalized` or exact SKU (case-insensitive) |
| 1 | SKU prefix |
| 2 | Name / brand / designer |

Pipeline: `$match` → `$addFields.searchRank` → `$sort` → `$skip` / `$limit`.

Browse without `q` unchanged: normal `find()` + `{ nameHe: 1 }` pagination.

## Security / Privacy

- Invalid or foreign `project`/`room` IDs → no banner, no private names
- Context loader requires: ownership, active onboarding, item-editable status, room belongs to project
- No client identity, pricing, or messages in context DTO

## Removed

- `ProjectProductPicker` modal (after catalog flow wired)
- `picker-actions.ts`, `project-product-picker-queries.ts`

## Regression Boundaries

Unchanged: Product data model, item status workflow, client snapshots, `commercialDirty`, admin pricing rounds, account approval (18C).

## Key Files

- `src/lib/catalog/catalog-params.ts` — URL helpers
- `src/lib/catalog/search-public-catalog-products.ts` — DB-side search ranking
- `src/lib/projects/get-architect-catalog-project-context.ts` — secure context
- `src/lib/projects/project-queries.ts` — `getArchitectEditableProjectOptions`
- `src/app/professional/projects/actions.ts` — `addProductFromCatalogContextAction`
- `src/components/catalog/CatalogProjectContextBanner/`
- `src/lib/auth/safe-next-url.ts` — login `next` param
