# Demo 11D — Admin Project Detail Redesign

## Scope

Visual/UX migration of `/admin/projects/[id]` to the 11A/11B/11C design language. No business logic, workflow, schema, or query changes.

**In scope:** Admin project detail page, review workspace progressive disclosure, structured project items, review history, admin message thread styling, helpers + tests, documentation.

**Out of scope:** Pricing/quotes, product/professional/public redesigns, query deduplication.

## Page Architecture

```
AdminPage (width="wide")
  AdminPageHeader
    project name, StatusBadge, meta strip, back action
  AdminDetailSection — סקירת פרויקט
    AdminProjectOverview
  AdminDetailSection — מוצרים בפרויקט
    AdminProjectItemsList / AdminProjectItemRow
  [Future: תמחור / הצעת מחיר — not rendered]
  AdminDetailSection — בדיקת פרויקט
    ProjectReviewPanel (submitted) | unavailable copy
  AdminDetailSection — היסטוריית בדיקה (if entries)
    AdminProjectReviewHistory (newest first)
  ProjectMessageReadMarker
  AdminDetailSection — שיחה על הפרויקט
    ProjectMessageThread (variant="admin")
```

Reading order: **what is this → what was ordered → what to do → what happened → communication**.

## Information Hierarchy

| Zone | Content |
|------|---------|
| Header | Name, status badge, professional, item count, submitted/updated, unread link |
| Overview | Professional, dates, client, location, description |
| Items | Snapshot-based configuration rows (no live Product refetch) |
| Review | Progressive disclosure actions (submitted only) |
| History | Workflow decisions (newest first in UI) |
| Messages | Conversation thread (separate from history) |

## Project Items

Uses `getProjectItemConfigurationRows()` from snapshot data:

- Material, color (+ hex swatch when available), size, quantity
- SKU or product slug (`dir="ltr"`)
- Stale product: `StatusBadge` warning tone

No product images — not stored in snapshot.

## Review Workspace

`ProjectReviewPanel` uses local client UI state for progressive disclosure:

1. Action chooser: Approve / Request Changes / Reject
2. Selected action reveals one textarea (optional note for approve; required for others)
3. ConfirmDialog preserved for approve/reject
4. All Server Actions, validation, notifications unchanged

Non-submitted statuses show `getReviewUnavailableCopy()` text.

## Review History vs Messages

- **History:** system workflow decisions (`AdminProjectReviewHistory`)
- **Messages:** per-project conversation (`ProjectMessageThread`)
- Never merged visually or architecturally

## Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| 375px | Single column, stacked metadata, full-width actions |
| 768px | Overview 2-col label/value; item rows stack |
| 1024px+ | Item rows: identity + configuration grid |
| 1440px+ | Same single readable column within wide AdminPage |

## Accessibility

- One `<h1>` in header; section `<h2>` via `AdminDetailSection`
- Status always text via `StatusBadge`
- Form labels/errors via `FormField`
- Timestamps as `<time dateTime>`
- Focus management on changes/reject textarea reveal

## Server / Client Boundaries

| Component | Type |
|-----------|------|
| `page.tsx` | Server |
| Admin project-detail sections | Server |
| `ProjectReviewPanel` | Client |
| `ProjectMessageReadMarker` | Client |
| `ProjectMessageForm` | Client |

## Query Impact

Zero new queries. Same `getAdminProjectDetailView` + `getProjectMessages` on page load.

## Future Quote Insertion Point

Between **Project Items** and **Review Workspace** — reserved in architecture, no placeholder UI.

## Legacy Removed

- Inline item/history markup from admin project page
- Bordered card patterns on project detail
- Dead button/textarea SCSS in `ProjectReviewPanel.module.scss`

## Files

**Created:** `src/components/admin/project-detail/*`, `project-display-helpers.test.ts`, this doc.

**Modified:** `page.tsx`, `ProjectReviewPanel`, `ProjectMessageThread`, `ProjectMessageForm`, `project-display-helpers.ts`.
