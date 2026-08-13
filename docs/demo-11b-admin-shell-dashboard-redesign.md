# Demo 11B — Admin Shell + Dashboard Redesign

## Scope

Visual/UX restructuring of the Admin shell and dashboard. No business logic, route, model, auth, or workflow changes. Individual management list/form pages unchanged (deferred to 11C/11D).

## Before / Audit

**Shell (pre-11B):**
- Flat 7-item sidebar with bordered-box active state
- Topbar duplicated brand + utility actions
- Mobile nav with inconsistent active styling vs desktop
- `AdminShell.module.scss` identical to professional shell
- Layout fetched `getSubmittedProjectCount()` for nav badge only

**Dashboard (pre-11B):**
- Four product/category stat cards
- Single link to products
- No attention area, projects, messages, or users

## Design Direction

Muuto / MDF Italia inspired — premium editorial workspace:
- Calm architectural sidebar with thin borders
- Typography-first metrics (no SaaS stat cards)
- Restrained warm accent on active nav indicator
- Generous whitespace, minimal shadows

## Shell Architecture

```
admin/layout.tsx (RSC)
  └─ AdminShell (RSC)
       ├─ AdminSidebar (client — pathname)
       ├─ AdminMobileNav (client — open state, pathname)
       └─ main.content → page children
```

- Brand block lives in sidebar (desktop) and mobile drawer
- Topbar is intentionally minimal: admin email, public link, logout
- No AdminContextLabel — page context via `AdminPageHeader` on each page

## Navigation Hierarchy

Visual groups (routes unchanged):

| Group | Items |
|-------|-------|
| (standalone) | ראשי |
| קטלוג | מוצרים, קטגוריות, חומרים, צבעים |
| עבודה | פרויקטים (submitted badge) |
| מערכת | משתמשים |

Config: [`src/config/admin-nav.ts`](../src/config/admin-nav.ts)

Shared rendering: [`AdminNavList`](../src/components/admin/AdminNavList/AdminNavList.tsx)  
Active helper: [`isActiveAdminPath`](../src/lib/admin/is-active-admin-path.ts)

## Page Container

| Component | Purpose |
|-----------|---------|
| `AdminPage` | Width wrapper (`default` = 56rem, `wide` = full) |
| `AdminPageHeader` | title, description, actions slot, children for filters |

Dashboard uses both. List pages keep local headers until 11C.

## Dashboard Hierarchy

1. `AdminPageHeader` — welcome intro
2. **דרוש טיפול** — submitted projects + unread admin messages
3. **מבט על המערכת** — typography metrics
4. **פעולות מהירות** — 4 shortcut links (11A Button)
5. **פרויקטים אחרונים** — up to 5 recent submitted (hidden when empty)

## Dashboard Data

Page-specific query: [`getAdminDashboardData`](../src/lib/admin/getAdminDashboardData.ts)

| Field | Source |
|-------|--------|
| submittedProjectCount | `Project.countDocuments({ status: "submitted" })` |
| unreadAdminMessageCount | `getUnreadAdminProjectMessageCount(adminUserId)` |
| activeProducts | `Product.countDocuments({ isActive: true })` |
| featuredProducts | `Product.countDocuments({ isFeatured: true })` |
| activeCategories | `Category.countDocuments({ isActive: true })` |
| activeMaterials | `Material.countDocuments({ isActive: true })` |
| activeColors | `Color.countDocuments({ isActive: true })` |
| activeProfessionals | `User.countDocuments({ role: "professional", isActive: true })` |
| recentSubmittedProjects | `Project.find({ status: "submitted" }).sort({ submittedAt: -1 }).limit(5)` |

Layout still runs only `getSubmittedProjectCount()` for nav badge.

## Responsive Behavior

| Viewport | Behavior |
|----------|----------|
| 375–1023px | Mobile overlay nav, compact topbar brand |
| 1024px+ | 16.5rem sidebar, utility topbar |

Breakpoints: tablet 768px, desktop 1024px (unchanged).

## Accessibility

- `aria-current="page"` on active nav links
- `aria-expanded` / `aria-controls` on mobile menu
- Escape closes mobile menu; focus returns to toggle
- Semantic `<aside>`, `<nav>`, `<main>`, heading hierarchy on dashboard
- Nav badge retains descriptive `aria-label`

## Server / Client Boundary

| Component | Type |
|-----------|------|
| AdminShell, AdminBrand | Server |
| AdminSidebar, AdminMobileNav, AdminNavList | Client |
| AdminPage, AdminPageHeader, dashboard sections | Server |
| Dashboard page | Server (async data) |

## Legacy Compatibility

- List/form/detail pages unchanged — local `.header`/`.title` patterns remain
- Shell `.content` padding only; no global max-width on list pages
- `AdminStatusBadge`, local `.createLink` styles coexist until 11C

## 11C Handoff

- Migrate list page headers to `AdminPageHeader`
- Replace local action links with 11A `Button`
- Table/card unification
- Remaining `window.confirm` → `ConfirmDialog`
- `AdminStatusBadge` → 11A `StatusBadge`

## Files

See implementation summary in commit / PR notes.
