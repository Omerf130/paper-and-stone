# Phase 18C — Client Registration Approval

Every new Client registration requires Admin approval before Client Workspace access. Architect applicants follow a separate queue; rejected architect applicants do **not** enter the Client approval queue.

## Data Model

- **`accountStatus`**: `pending` | `approved` | `rejected` (explicit registration approval state)
- **`isActive`**: unchanged — Admin suspend/deactivate only
- Legacy users without `accountStatus` normalize to `approved` via `normalizeAccountStatus()`

## Registration Flow

1. All registrations create `role: client`, `accountStatus: pending`, `isActive: true`
2. Architect applicants also set `requestedRole: architect`
3. Session is created; user redirects to `/account/status?registered=1`
4. No workspace access until approved

## Login / Guards

- `resolvePostAuthDestination()` sends pending/rejected users to `/account/status`
- Approved users go to role workspace (`/client`, `/professional`, `/admin`)
- `requireClient()` / `requireArchitect()` redirect non-approved users to `/account/status`
- Header/mobile nav hide workspace links until approved; show **סטטוס חשבון** instead

## Admin Queues

| Queue | Filter |
|-------|--------|
| `/admin/client-requests` | `role=client`, `requestedRole=null`, `accountStatus=pending`, `isActive=true` |
| `/admin/architect-requests` | `role=client`, `requestedRole=architect`, `accountStatus=pending`, `isActive=true` |

### Architect Decisions

| Action | Result |
|--------|--------|
| Approve | `role=architect`, `requestedRole=null`, `accountStatus=approved` |
| Reject | `role=client`, `requestedRole=null`, `accountStatus=rejected` |

Rejected architect applicants **do not** appear in the Client queue.

### Client Decisions

| Action | Result |
|--------|--------|
| Approve | `accountStatus=approved` |
| Reject | `accountStatus=rejected` |

## Assignment Eligibility

Client picker and project assignment require:

- `role=client`
- `isActive=true`
- `accountStatus=approved` (or legacy missing → approved)

## Migration

```bash
npm run migrate:18c-account-status
```

Sets `accountStatus: approved` on all existing users missing the field.

## Key Files

- `src/lib/users/account-status.ts` — normalization + labels + approved filter
- `src/lib/auth/account-access.ts` — workspace access + post-auth routing
- `src/lib/users/account-approval-mutations.ts` — approve/reject client registration
- `src/lib/users/client-request-queries.ts` — pending client queue
- `src/app/admin/client-requests/` — admin UI
- `src/app/(public)/account/status/` — pending/rejected user page

## Out of Scope (Phase 18D+)

- Client re-registration after rejection
- Email notifications on approval/rejection
