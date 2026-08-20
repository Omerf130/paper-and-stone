# Phase 17G — Final Workflow, UX & Mobile Polish

## Purpose

Phase 17G is the final subphase of Phase 17. It polishes the Admin, Architect, and Client workflows for operational clarity, mobile usability (375px primary), Hebrew copy consistency, and manual E2E readiness — without new product features or route renames.

## Critical fixes

### Product Picker in active Architect workspace

**Problem:** Active layered-pricing projects used `ArchitectProjectWorkspace`, which had room management and pricing but no way to add products.

**Fix:** Integrated existing `ProjectProductPicker` into `ArchitectProjectWorkspace` / `ArchitectProjectRoomAccordion` with per-room "+ הוספת מוצר" CTAs (including empty rooms). No merge with `ProjectRoomWorkspace`.

### Messaging projectId bug

**Problem:** `ProjectConversationThread` passed a prefixed DOM id to `sendAction`, breaking Mongo ObjectId validation.

**Fix:** `formControlId` for DOM uniqueness; `projectId` for server actions via `resolveProjectMessageSendId()`. Regression test in `resolveProjectMessageSendId.test.ts`.

### Client approved-content-unavailable state

When live project is approved but displayable content is temporarily unavailable, clients see:

- Label: "הגרסה המאושרת אינה זמינה כרגע"
- Supporting: "לא ניתן להציג כרגע את פרטי הפרויקט המאושרים. ניתן לנסות שוב מאוחר יותר."

No internal terms (snapshot, database, etc.) are exposed. Messaging remains available when assignment is valid.

## UX changes by role

### Admin

- Project list badges simplified (no duplicated "נשלח: נשלח" pattern)
- Single primary attention reason per row
- Unified unread labels via `formatUnreadMessageLabel`
- Admin↔Architect message section titled "שיחה עם האדריכל"
- `commercialDirty` badge copy centralized; **does not** enter attention queue (17D.3 preserved)

### Architect

- Product picker wired into primary workspace
- Project detail order: workspace → submit → metadata → messages
- Submit button explains blockers (empty project, incomplete/stale pricing)
- Dashboard attention: commercial-dirty count, client unread aggregate
- Project rows: contextual primary CTA ("המשך עבודה" / "פתיחת שיחה")
- Separate message sections with consistent `InternalDetailSection` chrome

### Client

- Softer no-snapshot copy without internal terminology
- Updating projects: supporting text on cards; approved totals hidden while updating
- Unread messages link to `#architect-messages` on project detail
- Read-state labels hidden in client thread
- Back navigation on project detail
- Registration helper text for architect applicants

## Presentation helpers

- [`src/lib/projects/project-status-presentation.ts`](../src/lib/projects/project-status-presentation.ts) — commercial-dirty copy, admin primary attention label
- [`src/lib/client-projects/client-project-presentation.ts`](../src/lib/client-projects/client-project-presentation.ts) — approved-content-unavailable branch

## Preserved rules

- `commercialDirty` alone does NOT enter Admin attention
- Client commercial content from `ClientApprovedProjectSnapshot` only
- Architect never sees internal cost or Admin markup
- Admin architect↔client thread read-only without mark-read
- `clientUserIdAtSend` reassignment privacy unchanged
- Legacy `onboardingStatus == null` projects unchanged
- `/professional` route unchanged
- No client navigation unread badge (card indicators only)

## Manual E2E checklist

1. Register new Architect applicant (see helper text; lands in `/client`)
2. Admin approves Architect access
3. Architect creates Project
4. Admin approves Project + assigns Client
5. Architect creates Rooms
6. Architect adds Products via picker/code search in workspace
7. Admin prices Products (inline workspace)
8. Architect sets Client markup/pricing
9. Architect submits Project
10. Admin reviews + approves
11. Client sees approved Project
12. Architect ↔ Client messaging
13. Architect modifies approved Project
14. Client continues seeing previous approved content
15. Architect re-submits
16. Admin approves revision
17. Client sees updated approved content

## Known limitations

- Global notification center for architect↔client messages deferred
- Admin dashboard quote metrics remain legacy-oriented
- `/professional` → `/architect` route rename deferred
- Post-login return URL not implemented
