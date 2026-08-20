# Phase 17E-B — Client Workspace

## Purpose

Phase 17E-B delivers the authenticated Client workspace. Clients see Projects assigned to them and approved commercial content from `ClientApprovedProjectSnapshot` only.

## Assignment vs content

| Concern | Source | Rule |
|---------|--------|------|
| Project visibility | Live `Project.clientUserId` | Client sees Project if assigned — **no** `onboardingStatus === "active"` filter |
| Rooms, products, prices | `ClientApprovedProjectSnapshot` | Render only when approved snapshot exists |

Knowing a `projectId` is never sufficient. Every query verifies `Project.clientUserId === session.user.id`. Detail also verifies snapshot `clientUserId`.

## Routes

| Route | Purpose |
|-------|---------|
| `/client` | Dashboard — greeting, recent projects, summary counts |
| `/client/projects` | Paginated assigned project list (optional name search) |
| `/client/projects/[id]` | Approved snapshot detail or informational no-snapshot page |

All routes use `requireClient()` — only `role=client` (inactive users blocked by session layer).

## Client-facing states

Pure helper: `getClientProjectPresentationState()`

| State | Label | When |
|-------|-------|------|
| In progress | בתהליך עבודה | Assigned, no approved snapshot |
| Approved | גרסה מאושרת | Snapshot exists, live project stable |
| Updating | הפרויקט מתעדכן | Snapshot exists, live revision dirty/submitted/changes_requested |

Internal enums (`pending_approval`, `commercialDirty`, etc.) are never exposed.

## No-snapshot UX

Assigned Project without snapshot:

- Appears in list/dashboard
- Detail shows project name, architect, state "בתהליך עבודה"
- Copy: no approved version yet
- **No** rooms, products, counts, or prices from live Project

## Approved snapshot UX

- Header: name, architect, status, approved date, counts, project total
- Updating banner when live project changed since approval
- Room accordion (snapshot order)
- Product cards: image, name, code, configuration, quantity, client prices
- Totals from snapshot fields only

## Inconsistency

If live `status === "approved"` but snapshot missing: safe message — never fallback to live items.

## Reassignment

- Old Client: project disappears immediately (assignment query fails)
- New Client: project visible; no snapshot until next commercial approval

## Shell & navigation

Dedicated `ClientShell` (not Admin/Professional):

- Nav: ראשי, הפרויקטים שלי
- Mobile-first (375px), touch targets ≥44px
- Architect request banner when `requestedRole=architect` (non-blocking)

## Auth redirects

| Role | Post-login/register |
|------|---------------------|
| client | `/client` |
| architect | `/professional` |
| admin | `/admin` |

Public header: client link to `/client`.

## Security boundary

Client DTOs exclude internal pricing, markup, architect prices, admin notes, identification numbers, live `Project.items`.

Privacy tests recursively scan serialized views.

## Deferred

- Architect↔Client messaging
- Payments, PDF export, snapshot history browser
- `/professional` → `/architect` rename
- ProjectQuote removal

## Key files

- `src/lib/client-projects/*` — queries, presentation state, mappers
- `src/app/client/**` — routes
- `src/components/client/**` — shell, cards, accordion
- `src/types/client-project.ts` — safe view types
