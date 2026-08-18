# Phase 17C — Rooms + Fast Product Picker + Project Workspace

Phase 17C turns an **active** onboarding-workflow Project into a room-based product workspace with a server-paged Product Picker, while preserving legacy flat projects and deferring all pricing.

## Room architecture

| Concept | Implementation |
|---------|----------------|
| Storage | Separate `ProjectRoom` collection (`src/models/ProjectRoom.ts`) |
| Item link | Optional `roomId` on embedded `Project.items[]` |
| Scope | Rooms are project-specific; never global |
| Names | Duplicate room names allowed within a project |

### ProjectRoom fields

- `projectId`, `name`, `order`, `createdByUserId`, timestamps
- Index: `{ projectId: 1, order: 1 }`

## Legacy vs room-based workspace

Central helper: `usesRoomBasedWorkspace(project)` in `project-workspace-gates.ts`

| Project type | Detection | UX |
|--------------|-----------|-----|
| Legacy | `onboardingStatus == null` | Flat item list (unchanged) |
| New workflow | `onboardingStatus != null` | Room rail + selected room workspace |

Room/item mutations additionally require `isProjectRoomEditable(project)`:
- onboarding `active`
- commercial status in `draft` or `changes_requested`

## Room lifecycle (Architect)

- **Create** — next sequential `order`, validated name (max 80)
- **Rename** — dialog; ID and items unchanged
- **Reorder** — move up/down; server validates full ID set belongs to project
- **Delete** — blocked if any item references `roomId` (no cascade)

Admin: read-only room-grouped view via `AdminProjectRoomsPanel`.

## Selected room URL

`/professional/projects/[id]?room=<roomId>`

- Invalid/missing → first room by `order`
- Refresh-safe; preserved across server actions where appropriate

## Product code (SKU)

**Decision:** existing `sku` is the canonical Product code. No `productCode` field.

- Admin label: **קוד מוצר**
- Display value preserved; `skuNormalized` (trim + lowercase) for case-insensitive uniqueness
- Sparse unique index: `skuNormalized_unique`
- Backfill: `scripts/backfill-sku-normalized-17c.ts` (collision inspect → idempotent backfill → index)

Duplicate error: `קוד המוצר כבר קיים במערכת`

## Product Picker

Project-scoped server action: `searchProductsForPickerAction({ projectId, query, page })`

Auth via `verifyProjectPickerAccess`:
- owner architect
- room-based workspace
- onboarding active
- item-editable commercial status

Query: `searchProductsForProjectPicker` — active products only, page size 16, ranking:
1. Exact SKU/code match
2. SKU prefix
3. Hebrew name match

Catalog-safe DTO only (no cost/admin fields). Configuration reuses `useProductConfiguratorState` + existing validation.

Flow: **+ הוספת מוצר** → search/browse → configure → add to selected room.

## Item semantics

- New workflow adds require validated `roomId`
- Duplicate configuration dedup is **per room** (selection key includes `roomId`)
- Snapshot includes `sku` when available (`buildProjectItemSnapshot`)
- **Move item:** `moveProjectItemToRoom` — only `roomId` changes; config/snapshot preserved

## Public PDP add-to-project

Legacy projects: unchanged.

Room-based projects: `AddToProjectDialog` adds room selection after project selection.

## Commercial workflow

Submission/review unchanged. Submitted projects lock room CRUD and item moves via existing commercial gates.

Admin commercial review for room-based projects shows items grouped by room.

## Authorization summary

| Action | Architect (owner) | Admin | Client |
|--------|-------------------|-------|--------|
| Room CRUD | When `isProjectRoomEditable` | View only | Never |
| Product Picker search | Project-scoped | N/A | N/A |
| Add/move items | When item editable | N/A | N/A |

## Deferred (Phase 17D+)

- Layered pricing / markup / client price
- Client dashboard and client project pages
- Architect↔Client messaging
- `/professional` → `/architect` rename
- Drag-and-drop room planner

See also: [`docs/phase-17b-project-onboarding-client-assignment.md`](phase-17b-project-onboarding-client-assignment.md)
