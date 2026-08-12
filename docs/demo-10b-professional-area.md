# Demo 10B — Professional Area + ProfessionalProfile Foundation

Demo 10B adds a protected professional area, lazy ProfessionalProfile creation, and self-service profile editing. Projects, messaging, notifications, and `professionalType` are deferred to Demo 10C+.

## Authorization

| Role | `/professional` access | Header link |
|------|------------------------|-------------|
| Unauthenticated | Redirect → `/login` | — |
| `customer` | Redirect → `/` | None |
| `professional` | Allowed | **אזור מקצועי** → `/professional` |
| `admin` | Redirect → `/` (no impersonation) | **ניהול** → `/admin` only |

**Source of truth:** `User.role` on the User document. `requireProfessional()` mirrors `requireAdmin()` — layout guard + mutation guard.

## ProfessionalProfile model

Separate MongoDB collection, 1:1 with User via unique `userId`.

| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId → User | Unique, indexed |
| `fullName` | string? | Optional in 10B |
| `phone` | string? | Optional in 10B |
| `companyName` | string? | Optional in 10B |
| `city` | string? | Optional in 10B |
| `bio` | string? | Optional in 10B |

**Deferred:** `professionalType` (architect, designer, etc.)

## Lazy profile creation (race-safe)

Profile is **not** created when admin assigns `role: "professional"`.

On first access to `/professional` layout:

```ts
ProfessionalProfile.findOneAndUpdate(
  { userId },
  { $setOnInsert: { userId } },
  { upsert: true, new: true, setDefaultsOnInsert: true }
)
```

- Atomic upsert prevents duplicate profiles on concurrent first requests
- `$setOnInsert` only — existing `fullName`, `phone`, etc. are never overwritten by `ensureProfessionalProfile()`
- Profile edits only via `updateMyProfessionalProfile()`

## Profile lifecycle

| Event | Behavior |
|-------|----------|
| Role promoted to `professional` | No profile created yet |
| First visit to `/professional` | Lazy profile created |
| Role demoted (`professional` → `customer`/`admin`) | Profile **retained** in DB; access to `/professional` lost |
| Re-promoted to `professional` | Existing profile reused |

## Routes

| Route | Purpose |
|-------|---------|
| `/professional` | Dashboard — welcome, profile completeness |
| `/professional/profile` | Self-edit profile (no `[id]` route) |

No Projects/messages placeholder routes in 10B.

## Shell

`ProfessionalShell` mirrors Admin pattern:

- Desktop sidebar (`ProfessionalSidebar`)
- Mobile overlay nav (`ProfessionalMobileNav`)
- Top bar: brand, "חזרה לאתר", logout

Nav config: `src/config/professional-nav.ts` — **ראשי**, **הפרופיל שלי** only.

## Header integration

Professional entry point in 10B:

- **Desktop:** `HeaderAccount` — "אזור מקצועי" for `professional` role
- **Mobile:** `MobileMenu` — same link in account section

**Not modified:** `ProfessionalsSection` homepage CTA (deferred until Projects).

## Security

- `updateMyProfessionalProfileAction()` derives `userId` from `requireProfessional()` — no client-supplied `userId` or `profileId`
- MongoDB update filter: `{ userId: currentUser.id }` only
- Admin cannot access `/professional` (redirect to `/`)

## Future direction (document only)

| Area | Direction |
|------|-----------|
| Projects | `ownerUserId` references User, not ProfessionalProfile ID |
| Messaging | Identity keyed by User IDs, not profile IDs |

## Deferred Demo 10C+

- Projects CRUD and ownership
- Messaging between customer and professional
- Notifications
- `professionalType` field and admin assignment
- Homepage/login deep-link UX for professionals
