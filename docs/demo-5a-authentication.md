# Demo 5A — Authentication Foundation

First-party authentication with MongoDB-backed opaque sessions, bcrypt password hashing, and role foundation for future admin protection.

## Scope

Implemented in this demo:

- User and Session Mongoose models
- Registration (`/register`) — always creates `customer` role
- Login (`/login`) — generic failure message
- Logout — invalidates DB session and clears cookie
- `getCurrentUser()`, `requireUser()`, `requireAdmin()` helpers
- Header auth state (login/register vs account/logout)
- Admin seed via `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars
- Focused unit tests

**Not implemented:** `/admin`, dashboards, password reset, OAuth, email verification.

## User Model

File: [`src/models/User.ts`](../src/models/User.ts)

| Field | Type | Notes |
|-------|------|-------|
| `email` | string | required, unique, lowercase, trimmed |
| `passwordHash` | string | required, bcrypt hash only |
| `role` | `"customer" \| "professional" \| "admin"` | default `"customer"` |
| `isActive` | boolean | default `true` |
| `createdAt`, `updatedAt` | Date | Mongoose timestamps |

Public registration never accepts `role`, `isActive`, or `passwordHash` from the client.

## Session Model

File: [`src/models/Session.ts`](../src/models/Session.ts)

| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId | ref User |
| `tokenHash` | string | SHA-256 hash of raw token, indexed unique |
| `expiresAt` | Date | TTL index (`expireAfterSeconds: 0`) |
| `createdAt` | Date | default now |

Raw session tokens are **never** stored in MongoDB.

## Password Hashing

File: [`src/lib/auth/password.ts`](../src/lib/auth/password.ts)

- Library: **bcrypt**
- Work factor: **12 rounds**
- `hashPassword()` / `verifyPassword()` — server-side only

## Opaque Session Strategy

1. Server generates `crypto.randomBytes(32)` → base64url token
2. SHA-256 hash stored in `Session.tokenHash`
3. Raw token sent to browser in HttpOnly cookie (`ps_session`)
4. Lookup: cookie → hash → Session → User → `SafeUser`

### Cookie Configuration

Centralized in [`src/lib/auth/config.ts`](../src/lib/auth/config.ts):

| Setting | Value |
|---------|-------|
| Name | `ps_session` |
| HttpOnly | `true` |
| SameSite | `Lax` |
| Secure | `true` in production only |
| Path | `/` |
| Max age | 7 days |

## Auth Library Structure

```
src/lib/auth/
  config.ts          — cookie name, max age
  password.ts        — bcrypt hash/verify
  session.ts         — create, lookup, delete, cookie helpers
  current-user.ts    — getCurrentUser(), toSafeUser()
  authorization.ts   — requireUser(), requireAdmin(), isAdminUser()
  validation.ts      — Zod schemas, Hebrew field errors
  user-service.ts    — createCustomerUser, authenticateUser
  seed-admin.ts      — idempotent admin seed
  logout-action.ts   — logout Server Action
```

## Registration Flow

Route: `/register`

1. Client submits email, password, passwordConfirm
2. Server Action validates with Zod (server-side only)
3. Duplicate email check → Hebrew error if exists
4. `createCustomerUser()` — hardcoded `role: "customer"`
5. `createSession()` + HttpOnly cookie
6. Redirect to `/`

Password confirmation is UX-only; it is never persisted.

## Login Flow

Route: `/login`

1. Validate email + password
2. Find user by normalized email
3. Reject if user missing, inactive, or password invalid
4. Generic error: `"פרטי ההתחברות אינם נכונים"` (no email enumeration)
5. Create session + cookie
6. Redirect to `/` (all roles, including admin)

## Logout Flow

- Header form calls `logoutAction` Server Action
- Reads session cookie
- Deletes matching Session document from DB
- Clears cookie
- Redirects to `/`

## Current User Lookup

`getCurrentUser()` in [`src/lib/auth/current-user.ts`](../src/lib/auth/current-user.ts):

1. Read `ps_session` cookie
2. Hash token, find non-expired Session
3. Load User, verify `isActive`
4. Return `{ id, email, role }` — never `passwordHash`

## Role Foundation

Three roles exist on the User model:

- `customer` — public registration default
- `professional` — reserved for future approval flow
- `admin` — created via seed only

Authorization helpers (ready for Demo 5B):

- `requireUser()` — redirects to `/login` if unauthenticated
- `requireAdmin()` — redirects to `/` if not admin

## Admin Seed

Env vars in `.env.local`:

```
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Behavior in [`src/lib/auth/seed-admin.ts`](../src/lib/auth/seed-admin.ts):

| Case | Action |
|------|--------|
| `ADMIN_EMAIL` missing | Skip, log message, product seed continues |
| Admin does not exist | Require `ADMIN_PASSWORD`, hash, create admin |
| Admin already exists | Set `role: "admin"`, `isActive: true` — **do not replace passwordHash** |
| New admin, no password | Skip creation, log message |

Idempotent: running `npm run seed` twice does not duplicate admins or reset passwords.

Credentials are never logged.

## CSRF / Mutation Safety

Login, register, and logout use **Next.js Server Actions** exclusively.

Next.js verifies same-origin POST requests for Server Actions automatically — no custom CSRF token framework.

Logout uses a native form POST to the Server Action (works without client JavaScript).

## Header Auth State

[`src/components/Header/Header.tsx`](../src/components/Header/Header.tsx) is an async Server Component calling `getCurrentUser()`.

| State | Desktop | Mobile drawer |
|-------|---------|---------------|
| Logged out | התחברות + הרשמה | התחברות + הרשמה |
| Logged in | החשבון שלי + התנתקות | החשבון שלי + התנתקות |

No admin navigation, no email display, no account dashboard.

## Tests

Run: `npm run test`

Coverage:

- Password hash/verify
- Zod validation (email normalize, password rules, confirmation match)
- `isAdminUser()` rejects non-admin
- Session token hashing and expiry helper
- Registration always assigns `customer` role
- Admin seed: create new, preserve existing passwordHash, skip without password

## Deferred

- `/admin` route and shell (Demo 5B)
- Product CRUD, user management
- Account/professional dashboards
- Email verification, password reset, OAuth, MFA
- Professional registration/approval
- Rate limiting, session management UI
- Admin password reset operation

## Environment

See [`.env.example`](../.env.example):

```
MONGODB_URI=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

`.env.local` remains gitignored.
