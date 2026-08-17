# Phase 17A — Identity / Roles / Architect Access Request

Phase 17A introduces the client-by-default registration model, architect access requests, and the canonical role system (`client`, `architect`, `admin`) while keeping `/professional` routes and `ProfessionalProfile` temporarily.

## Business model

- Every new registration creates an active user with `role = client`.
- Registration user type:
  - **Client** → `role = client`, `requestedRole = null`
  - **Architect applicant** → `role = client`, `requestedRole = architect`
- Both can log in immediately as clients.
- Admin approves architect access in a dedicated queue.
- No `approvalStatus` workflow. `isActive` remains for admin deactivation only.

## Role architecture

| Canonical role | Legacy stored value | Authorization |
|----------------|---------------------|---------------|
| `client` | `customer` | `requireClient()` |
| `architect` | `professional` | `requireArchitect()` / `requireProfessional()` alias |
| `admin` | `admin` | `requireAdmin()` |

`requestedRole` is **never** used for authorization.

## User fields added

- `fullName` — required on new registration
- `identificationNumber` — required on new registration; admin-only visibility
- `requestedRole` — `"architect" | null` only

Email remains the unique account identifier. Identification number is not globally unique.

## Registration

Route: `/register`

Required fields: full name, email, password, password confirmation, identification number, user type (client / architect).

Post-registration redirect:

- Client → `/`
- Architect applicant → `/?registered=architect-request` with homepage banner

Temporary until Phase 17E client workspace exists.

## Session behavior

Session cookie stores `userId` only. Role is read live from MongoDB on each request via `getCurrentUser()` → `toSafeUser()` with normalization.

When Admin upgrades a client to architect:

- Existing session remains valid
- Next server authorization check sees `role = architect`

When Admin downgrades architect → client:

- `/professional` access disappears on next authorization check

## Admin architect request queue

Route: `/admin/architect-requests`

Shows users where:

- `role = client` (legacy `customer` supported in query during migration)
- `requestedRole = architect`
- `isActive = true`

Actions:

- **Approve** → `role = architect`, `requestedRole = null`, lazy `ProfessionalProfile` creation, seed profile `fullName` from user when empty
- **Decline** → `requestedRole = null`, keep `role = client`

Dashboard attention and admin nav badge surface pending count.

## Manual role management

Admin can change roles between `client`, `architect`, and `admin` on `/admin/users`.

Rules:

- Promoting to architect clears `requestedRole`
- Any manual role change clears `requestedRole`
- Architect → client downgrade blocked when user owns any project (`ownerUserId`)

## Client privacy

- Architect must never see a system-wide client list.
- Only Admin may list/search users.
- Future (17B): Architect sees only the client assigned to a specific project.

## Architect ↔ Client communication

Deferred to Phase 17B/17E. Must remain project-scoped and must not depend on a client directory.

## Compatibility

- `/professional` route tree unchanged
- `ProfessionalProfile` unchanged; only actual architects enter workspace
- Historical project/message actor enums keep `"professional"` in stored records
- Legacy user roles normalized on read until migration completes

## Deployment / migration order

1. Deploy code with legacy enum support + normalization on read
2. Run `npm run migrate:17a-roles`
3. Verify counts in each environment
4. Later phase may remove legacy enum values from schema

Migration script:

- `customer` → `client`
- `professional` → `architect`
- Initializes missing `requestedRole` to `null`
- Idempotent

## Deferred Phase 17B scope

- Project onboarding flow replacement
- Admin assigns client to project
- Project-scoped client visibility for architects
- Rooms, product picker, client dashboard
- Architect ↔ client messaging changes
- Re-request architect access from client UI
- `/professional` → `/architect` route migration
- Remove legacy role enum values from schema

See also: [`docs/project-foundation.md`](project-foundation.md)
