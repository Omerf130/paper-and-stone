# Phase 17B — Project Onboarding + Client Assignment

Phase 17B introduces a separate **onboarding lifecycle** for architect-created projects, Admin-only client assignment, and workspace gates—while preserving legacy project behavior and keeping commercial review unchanged.

## Two axes

| Axis | Field | Values | Purpose |
|------|-------|--------|---------|
| Onboarding (new) | `onboardingStatus` | `pending_approval` → `active` / `rejected` | Admin approves project opening + assigns client |
| Commercial (legacy) | `status` | `draft` → `submitted` → review outcomes | Existing quote-gated approval flow |

**Legacy detection:** `onboardingStatus == null` → existing rules only. New architect-created projects always set `onboardingStatus`.

## Onboarding lifecycle

1. Architect creates project → `onboardingStatus = pending_approval`, no `clientName`, no items required.
2. Admin searches active clients (Admin-only) and approves → `onboardingStatus = active`, `clientUserId` set.
3. Architect can add/configure products and continue commercial workflow.
4. If rejected → architect edits metadata and resubmits → `pending_approval` again.

Onboarding events append to immutable `reviewHistory` (`onboarding_created`, `onboarding_approved`, `onboarding_rejected`, `onboarding_resubmitted`, `onboarding_client_reassigned`).

## Workspace gates

Central helpers in `src/lib/projects/project-workspace-gates.ts`:

- Item edits require onboarding `active` (new workflow) + commercial editable status.
- Metadata edits allowed during pending/rejected/active onboarding.
- Item workspace hidden until onboarding active.
- Messaging available for any onboarding project; legacy still requires first commercial submit.

## Privacy

- Client search/list is Admin-only (`client-lookup-queries.ts`).
- Architect views expose assigned client **full name only** (`assignedClientFullName`).
- `clientUserId` is not exposed on architect-facing views.

## Admin UX

- Projects list: queue tabs — **אישור פתיחה** (`?queue=onboarding`) vs **בדיקה מסחרית** (default).
- Dashboard attention item for pending onboarding count.
- Nav badge on `/admin/projects` combines commercial + onboarding attention.
- Project detail: `ProjectOnboardingReviewPanel` when pending; client reassignment when active.

## Architect UX

- Create form: name, location, description only (no client field).
- Pending: banner, editable metadata, no items/submit/quote.
- Rejected: banner + resubmit CTA.
- Active: shows assigned client name; items/submit/quote per commercial rules.

## Role safety

`verifyClientRoleChangeSafety` blocks client → architect/admin when user is assigned to active onboarding projects.

## Notifications

- `PROJECT_ONBOARDING_APPROVED`
- `PROJECT_ONBOARDING_REJECTED`

Recipient: project owner (architect) only. No client notifications in 17B.

## Explicitly deferred (17C+)

- Rooms / ProjectRoom
- Fast Product Picker
- Client dashboard (`/client`)
- Architect↔Client messaging
- Layered pricing / markup
- `/professional` rename

See also: [`docs/phase-17a-identity-architect-access.md`](phase-17a-identity-architect-access.md)
