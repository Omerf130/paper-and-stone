# Demo 11F — Professional Area Redesign

## Scope

Presentation-only migration of the entire Professional area to the 11A–11E design language. No schema, workflow, route, or public-site changes.

**In scope:** Professional shell, dashboard, profile, projects list/create/detail, notifications, shared internal page primitives (with Admin thin re-exports only), helpers + tests.

**Out of scope:** Pricing/quotes, public site, new dependencies, workflow changes.

## Shell Architecture

```
ProfessionalLayout
  InternalUiProviders
  ProfessionalShell
    ProfessionalSidebar — ProfessionalBrand + ProfessionalNavList
    topBar — ProfessionalMobileNav, compact brand, NotificationBadgeLink, logout
    main — page content
```

Flat nav: ראשי, הפרויקטים שלי, התראות (badge), הפרופיל שלי.

## Dashboard

`getProfessionalDashboardData(ownerUserId, userEmail)` on `/professional` only.

**Attention area:** changes_requested count, unread notifications, unread project messages, incomplete profile.

**Project prioritization (query-level):**
1. Fetch **all** `changes_requested` projects (no recency limit)
2. Fetch limited batches for draft/submitted/finalized
3. Merge via `mergePriorityDashboardProjects` — priority: changes_requested → draft → submitted → approved/rejected; within group: `updatedAt` desc; cap 5

This ensures older `changes_requested` projects never disappear from the dashboard.

## Page Architecture

All pages use `InternalPage` + `InternalPageHeader`.

### Project detail

```
InternalPageHeader — name, meta, add-products action
ProjectStatusBanner + ProjectSubmitButton
InternalDetailSection#project-overview — ProjectForm
InternalDetailSection#project-items — ProjectItemsList
[Future: הצעת מחיר — between items and history]
InternalDetailSection#project-history — chronological timeline
InternalDetailSection#messages — ProjectMessageThread
```

## Shared Primitives

| Primitive | Admin | Professional |
|-----------|-------|--------------|
| InternalPage | AdminPage re-export | direct import |
| InternalPageHeader | AdminPageHeader re-export | direct import |
| InternalDetailSection | AdminDetailSection re-export | direct import |

No Admin page file changes — thin re-exports preserve existing Admin APIs.

## Admin vs Professional

Shared: tokens, 11A primitives, status mappers, formatDateTime.

Differentiated: flat vs grouped nav, workspace dashboard vs operational admin dashboard, editorial project rows vs admin tables, notification top-bar link vs admin email.

## Query Impact

- Layout: unchanged (`getUnreadNotificationCount` for nav badge)
- Dashboard: one new page helper (~6 parallel queries)
- Other routes: unchanged

## Tests

- `is-active-internal-path.test.ts`
- `get-project-required-action-hint.test.ts`
- `getProfessionalDashboardData.test.ts` (merge priority logic)

## Deferred

- Quote/pricing section (insertion point documented in project detail page)
- Public site redesign
- Global message badge in shell nav
