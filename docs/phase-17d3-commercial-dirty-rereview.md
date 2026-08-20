# Phase 17D.3 — Commercial Dirty + Re-Review Flow

## Purpose

Approved layered-pricing projects can continue to change after admin approval (items, rooms, pricing, metadata). The `commercialDirty` flag tracks **"changed since last approval"** without inventing a new persisted status.

`commercialDirty` is orthogonal to `clientPriceStale`:

| Flag | Clears when |
|------|-------------|
| `clientPriceStale` | Architect updates client pricing after admin cost/markup change |
| `commercialDirty` | Architect re-submits for review, or admin completes a review action (approve / request changes / reject) |

## State model

| Status | `commercialDirty` | Meaning |
|--------|-------------------|---------|
| draft / changes_requested | false | Normal edit + initial/resubmit flow |
| submitted | false (expected) | Awaiting admin review |
| approved | false | Clean — matches last approval |
| approved | true | Changed since approval — architect must re-submit |
| rejected | false | Terminal until architect edits elsewhere |

**Re-submit path:** `approved + commercialDirty → submitted`, history action `"resubmitted"`, `submissionRevision` increments, `commercialDirty` cleared.

**Blocked:** `approved + clean` submit; defensive block on `submitted + dirty` approval.

## Trigger matrix

Mark dirty when **all** of:

- `usesLayeredPricing(project)` (new workflow)
- `status === "approved"`
- `commercialDirty !== true` (idempotent)

### Mutations that mark dirty

| Area | Mechanism |
|------|-----------|
| Item add/update/remove | Atomic `$set` via `appendCommercialDirtyToSet` |
| Move item to room | Atomic `$set` |
| Metadata (`updateProject`) | Atomic `$set` |
| Item admin/architect pricing | Atomic `$set` on same `updateOne` |
| Default admin/architect markup | `applyCommercialDirtyToDocument` before `save()` |
| Room create/rename/reorder/delete | Follow-up `markProjectCommercialDirtyIfNeeded` |

### Never mark dirty

- Legacy projects (`onboardingStatus == null`)
- draft, changes_requested, submitted, rejected
- Messages, notifications, admin notes

## Attention rules

### Architect

- Reason `commercial_dirty`: **"יש שינויים שטרם נשלחו לבדיקה"**
- Action-hint priority: stale client pricing → changes_requested → **commercial_dirty** → incomplete pricing → …
- Dashboard counts and merge priority include `approved + commercialDirty + onboarding active`

### Admin

- **Attention queue unchanged** — dirty approved projects do **not** enter `buildAdminProjectAttentionFilter` until re-submitted
- List/detail show secondary chip: **"השתנה מאז האישור"** when `approved + commercialDirty`

## Legacy compatibility

- No migration; existing approved projects remain `commercialDirty: false` (historical limitation)
- Legacy ProjectQuote flow unchanged

## Phase 17E recommendation (deferred)

For client visibility after re-approval cycles, two options:

1. **Live working state** with a clear "pending re-approval" indicator when architect has dirty changes not yet submitted, or project is submitted again
2. **Last-approved snapshot** published to client — requires snapshot architecture (not in 17D.3 MVP)

17D.3 defers client dashboard work entirely to 17E.

## Key files

- `src/lib/projects/project-commercial-dirty.ts` — central helper
- `src/lib/projects/project-submission.ts` — re-submit + clear dirty
- `src/lib/projects/project-admin-mutations.ts` — clear dirty on review
- `src/lib/projects/architect-project-attention.ts` — architect attention reason
