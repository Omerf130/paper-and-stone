# Phase 17E-A — Approved Client Snapshot Foundation

## Purpose

Clients must see only the **latest commercially approved** Project version — never the live working state. Phase 17E-A introduces a dedicated `ClientApprovedProjectSnapshot` collection, written at Admin commercial approval time.

Live Project (`Project.items`, rooms, pricing) continues to change after approval (`commercialDirty`). The Client snapshot updates **only** on successful commercial approval.

## Live vs snapshot

| Concern | Live Project | Client snapshot |
|---------|--------------|-----------------|
| Mutations after approval | Yes | No (immutable until next approval) |
| Internal/admin pricing | Present | Never stored |
| `commercialDirty` | Tracks unsent changes | Unchanged until re-approval |
| Client queries | Must not read `Project.items` | Read snapshot collection only |

## Schema (MVP)

One current snapshot per Project (`unique: { projectId: 1 }`).

- `schemaVersion: 1`
- `projectId`, `clientUserId`, `architectUserId`
- `projectName`, `location?`, `description?`
- `submissionRevision`, `approvedAt`
- `architect.fullName`
- `rooms[]`: `{ roomId, name, order, items[], clientRoomTotalAgorot }`
- `clientProjectTotalAgorot`

Item snapshot fields: product display, configuration labels, quantity, client unit/line prices, optional `{ url, alt }` image resolved at approval time.

## Security boundary

Snapshot storage and `ClientApprovedProjectView` exclude:

- `internalCostAgorot`, markup BPs, architect prices
- Admin notes/messages, identification numbers
- Product internal/admin fields

Privacy tests recursively scan serialized payloads.

## Approval flow

Layered projects only (legacy quote path unchanged):

1. Load existing snapshot (if any) for restorative rollback
2. Validate pricing completeness + assigned client + orphan-room rules
3. Build client-safe payload (rooms, thumbnails batch, architect name)
4. Upsert snapshot
5. Apply Project approval transition

### Consistency: snapshot-first + restorative compensating rollback

No Mongo transactions in this phase.

| Approval outcome | Snapshot after attempt |
|------------------|------------------------|
| First approval succeeds | New snapshot |
| First approval fails | No snapshot (delete if written) |
| Re-approval succeeds | Revision N snapshot |
| Re-approval fails | **Previous revision restored exactly** |

If compensating restore/delete fails: log both errors, throw controlled `SNAPSHOT_ROLLBACK_FAILED`. No retry worker in 17E-A.

## Revision behavior

- Revision 1 approved → snapshot revision 1
- Live changes + `commercialDirty` → snapshot stays revision 1
- Re-submit revision 2 + approve → snapshot replaced with revision 2

## Request changes / reject

Do **not** modify existing Client snapshot. Client keeps last approved version.

First reject (never approved): no snapshot.

## Onboarding approval

Does **not** create Client snapshot. Only commercial approval does.

## Client reassignment

When Admin reassigns Client on an active Project:

1. Delete existing snapshot for `projectId`
2. If `status === approved`: set `commercialDirty=true`

Prior Client loses access (queries verify live `Project.clientUserId`). New Client has no approved version until re-approval.

## Query foundation (17E-B prep)

- `getClientApprovedProjectSnapshots(clientUserId)`
- `getClientApprovedProjectSnapshotByProjectId(clientUserId, projectId)`

Ownership-scoped; verifies live client assignment. Future routes use `requireClient()`.

## Deferred — Phase 17E-B

- `/client` dashboard and project pages
- Client navigation, messaging, notifications UI
- “No approved version yet” UX
- Historical snapshot list / comparison

## Key files

- [`src/models/ClientApprovedProjectSnapshot.ts`](../src/models/ClientApprovedProjectSnapshot.ts)
- [`src/lib/client-snapshots/buildApprovedClientProjectSnapshot.ts`](../src/lib/client-snapshots/buildApprovedClientProjectSnapshot.ts)
- [`src/lib/client-snapshots/commercial-approval-with-snapshot.ts`](../src/lib/client-snapshots/commercial-approval-with-snapshot.ts)
- [`src/lib/client-snapshots/getClientApprovedProjectSnapshots.ts`](../src/lib/client-snapshots/getClientApprovedProjectSnapshots.ts)
