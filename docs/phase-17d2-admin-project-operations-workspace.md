# Phase 17D.2 — Admin Project Operations Workspace

Phase 17D.2 turns Admin Projects into an operational workspace: discoverable active projects, actionable attention views, and inline room/product pricing.

## Pricing usability root cause

Server gates from Phase 17D correction were already correct. Remaining problems were operational:

1. **Navigation gap** — `onboardingStatus: "active"` projects were excluded from all list queues after onboarding approval.
2. **Commercial queue bug** — new-workflow `status: submitted` projects were also excluded from commercial review.
3. **IA** — layered pricing lived inside a generic items section with heavy nested forms, not a pricing-first workspace.
4. **Structure** — items without rooms/`roomId` had no pricing surface.

## Admin Project list views

| View | URL queue | Filter |
|------|-----------|--------|
| דורש טיפול (default) | `attention` | Pending onboarding, submitted, or active projects with pricing gaps/stale client prices |
| פעילים | `active` | `onboardingStatus === "active"` |
| ממתינים לבדיקה | `commercial` | `status === submitted` (includes new-workflow) |
| ממתינים לאישור פתיחה | `onboarding` | `onboardingStatus === pending_approval` |

Search matches project name, legacy client name, architect email/name, assigned client name/email.

## Attention helpers

- `getProjectPricingAttention` / `getPricingAttentionFromAdminItems`
- `getAdminProjectAttentionReasons` — Hebrew labels for list/header/dashboard
- Nav badge = **attention project count** (single actionable number)

## Active Project workspace IA

For `onboardingStatus === "active"` room-based projects:

1. Project header (dual work/commercial status, counts, attention)
2. People summary + client reassignment
3. **Rooms accordion + inline pricing rows** (primary work area)
4. Project totals
5. Commercial review (when submitted)
6. Review history
7. Messages (secondary)

Legacy projects and pending onboarding keep prior layouts (quote panel / onboarding review).

## Inline pricing

- `AdminProjectItemPricingRow` — cost, markup inheritance, live architect preview, stale client indicator, dirty-gated Save
- Reuses `setProjectItemAdminPricingAction` + `expectedPriceVersion`
- Product thumbnails via batched `loadProductThumbnailMap` (no per-row Product fetch)

## Mobile

- Project list: cards at ≤1023px with full-width CTA
- Project detail: stacked product cards, room accordion with large tap targets, one open room on mobile

## Deferred (Phase 17D.3)

Commercial dirty / re-review after post-approval edits (`approved → submitted` or dirty flag). UI does not imply current pricing is still commercially approved after later changes.

See also: [`docs/phase-17d-layered-pricing-markup.md`](phase-17d-layered-pricing-markup.md)
