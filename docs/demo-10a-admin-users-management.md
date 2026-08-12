# Demo 10A — Admin Users Management

Demo 10A adds admin visibility and control over registered users: list, search, filter, paginate, change roles, and activate/deactivate accounts.

## User roles

| Role | Hebrew | Default on registration |
|------|--------|-------------------------|
| `customer` | לקוח | Yes |
| `professional` | איש מקצוע | Admin-assigned only |
| `admin` | אדמין | Seed / admin promotion only |

**Authorization source of truth:** `User.role` on the User document. Session stores `userId` only — role is read live on each `getCurrentUser()` call.

Users cannot promote themselves. Public registration always creates `role: "customer"`.

## Admin route

`/admin/users` — server-rendered list with toolbar, desktop table, mobile cards, pagination.

No `/admin/users/[id]` detail route in Demo 10A.

Navigation: **משתמשים** added to admin nav.

## List features

- Email search (`q`) — case-insensitive regex
- Role filter (`role`): customer / professional / admin
- Status filter (`status`): active / inactive
- Pagination: 20 users per page (`page`)
- Sort: newest registration first (`createdAt` desc)

All filters use URL search params and server-side MongoDB queries.

## Role update behavior

- Protected server action: `updateUserRoleAction`
- Zod-validated ObjectId + role enum
- Whitelisted write: `{ role }` only
- Admin promotion requires `window.confirm`
- Role change applies on next request (no session invalidation needed)

## Active / inactive behavior

- Protected server action: `updateUserActiveStatusAction`
- Deactivation requires confirmation
- Inactive users cannot log in (`authenticateUser` rejects)
- `getCurrentUser()` returns `null` for inactive users
- **On deactivation:** `Session.deleteMany({ userId })` removes all active sessions
- Reactivation does not restore sessions — user must log in again

## Self-protection

| Action | Rule |
|--------|------|
| Self-demotion | Admin cannot change own role away from `admin` |
| Self-deactivation | Admin cannot deactivate own account |

## Last-admin protection

Before demoting or deactivating an **active admin**, system counts active admins. If count ≤ 1, mutation is rejected with Hebrew error.

## Safe serialization

`AdminUserListItem` exposes: `id`, `email`, `role`, `isActive`, `createdAt`, `updatedAt`.

Never exposed: `passwordHash`, session tokens, internal secrets.

## Responsive UI

| Viewport | Layout |
|----------|--------|
| Desktop (≥768px) | Table |
| Mobile (<768px) | User cards — no horizontal table scroll |

Mobile cards show email, role, status (text badge), dates, role controls, activate/deactivate.

## Future: ProfessionalProfile

Demo 10A assigns `User.role = "professional"` only. Rich professional profile data (company, license, etc.) will be modeled separately in Demo 10B.

## Future: Projects & messaging

Demo 10A prepares role infrastructure for:

- `customer` — no Project access
- `professional` — future Project CRUD + submission
- `admin` — future Project review + internal messaging

Not implemented in Demo 10A.

## Key files

- [`src/app/admin/users/page.tsx`](../src/app/admin/users/page.tsx)
- [`src/app/admin/users/actions.ts`](../src/app/admin/users/actions.ts)
- [`src/lib/users/`](../src/lib/users/)
- [`src/components/admin/UserRowActions/`](../src/components/admin/UserRowActions/)
- [`src/lib/auth/session.ts`](../src/lib/auth/session.ts) — `deleteSessionsForUser`
