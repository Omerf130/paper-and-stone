# Phase 18B — Product Item Workflow UX by Role

Phase 18B wires the Phase 18A status foundation into role-specific operational UX across Admin, Architect, and Client.

## Core principle

**Project workflow** and **Product Item workflow** are separate domains. A Project may be approved while individual Products remain at different operational statuses.

**Client commercial visibility** remains governed only by `ClientApprovedProjectSnapshot`. Live `Project.items[]` is never a fallback for commercial content.

Phase 18B joins:

- Snapshot `projectItemId` → live item `status` / allowed transitions / presentation

only for items already present in the approved snapshot.

## Status UX by role

### Client

- Snapshot supplies identity, image, configuration, quantity, approved prices.
- Live query supplies workflow status only (`getClientProjectItemWorkflowStatuses`).
- Client-facing labels are simplified Hebrew (e.g. `"ממתין לאישור שלך"`, `"אושר על ידך"`, `"נדחה על ידך"`).
- `client_review` shows task-oriented actions:
  - **אישור מוצר** — immediate transition to `client_approved`
  - **דחיית מוצר** — confirm-only dialog (no reason field in 18B) → `client_rejected`
- Project cards and detail show `"N מוצרים ממתינים לאישור שלך"` when applicable.

### Architect

- Prominent clickable status menu when transitions exist (Phase 18A control, now `size="prominent"`).
- Card header/workflow area with operational context copy.
- `client_rejected` emphasized as action-required.
- Project workspace shows workflow summary chips (action vs informational).
- Dashboard aggregates rejected/resubmit (action) and client_review (informational) item counts.

### Admin

- Preserves Phase 18A clickable status badge menu on product cards.
- Workflow context copy in header (e.g. `"הלקוח אישר את המוצר"`).
- **היסטוריית סטטוס** dialog per product (role + from→to + timestamp; no user email).
- Workflow summary chips on list/detail (e.g. `"2 מוצרים בבדיקה פנימית"`).
- **דורש טיפול** queue extended additively for projects with items in:
  - `internal_review`
  - `client_rejected`
  - `resubmit`
- `client_review` is **not** in the Admin attention queue (waiting on Client).

## Centralized helpers

| Helper | Purpose |
|--------|---------|
| `project-item-workflow-attention.ts` | Status counts, Admin/Architect/Client attention summaries |
| `getClientProjectWorkflowReviewCounts.ts` | Batch review counts intersected with snapshot membership |
| `isProjectItemInClientApprovedSnapshot.ts` | Server guard for Client mutations |
| `getProjectItemStatusWorkflowContext()` | Role-specific operational copy |

## Security boundaries

- Client mutations require: assigned client + snapshot membership + allowed transition.
- Client workflow query selects only `items._id` and `items.status`.
- Status changes do not set `commercialDirty` or alter pricing rounds/snapshots.
- History UI shows role labels only (no N+1 user lookups).

## Responsive behavior

- Client approve/reject buttons: full-width on mobile, ~44px tap targets.
- Status menus and history dialog: RTL-aligned, keyboard accessible.
- Product cards stack vertically at 375px.

## Deferred scope

### Phase 18C
- Client registration approval, pending accounts, login approval gate

### Phase 18D
- Catalog-based add-product flow, `/products` project context, picker removal

### Also deferred
- Rejection reason persistence (requires schema design)
- WebSockets / push / email notifications
- Client status history UI

See also: [phase-18a-project-item-status-workflow.md](./phase-18a-project-item-status-workflow.md)
