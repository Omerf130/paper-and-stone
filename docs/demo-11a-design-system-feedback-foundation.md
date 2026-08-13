# Demo 11A — Design System + Feedback Foundation

## Scope

Shared internal UI primitives for Admin and Professional areas. No business logic changes. Public site unchanged.

## Design direction

Primary references: Muuto, MDF Italia.

Characteristics: editorial, premium, calm, restrained typography, generous whitespace, subtle borders, minimal shadows.

Not: generic SaaS dashboard, Bootstrap admin, bright semantic colors.

## Tokens

Extended [`src/styles/_tokens.scss`](../src/styles/_tokens.scss):

- Semantic state colors (success, warning, danger, info) — subtle editorial tones
- Primary action colors (`$color-primary`, `$color-primary-hover`)
- Interactive surfaces
- Shadow scale (`$shadow-sm`, `$shadow-md`)
- Z-index for toast/dialog
- Typography role aliases

## Primitives

| Component | Path | Purpose |
|---|---|---|
| Button | `src/components/ui/Button/` | primary, secondary, ghost, danger, text; loading state |
| Toast | `src/components/ui/Toast/` | success/error/warning/info; RTL; scoped to internal layouts |
| ConfirmDialog | `src/components/ui/ConfirmDialog/` | native `<dialog>`; controlled API |
| FeedbackBanner | `src/components/ui/FeedbackBanner/` | persistent contextual status |
| StatusBadge | `src/components/ui/StatusBadge/` | semantic tone badges |
| FormField | `src/components/ui/FormField/` | label, error, input styling |
| EmptyState | `src/components/ui/EmptyState/` | editorial empty pages |

Public [`Button`](../src/components/Button/Button.tsx) re-exports ui Button for backward compatibility.

## Feedback patterns

| Outcome | UX |
|---|---|
| Field validation | Inline `FieldError` |
| Operation success | Toast |
| General operation error | Toast |
| Persistent workflow state | `FeedbackBanner` (e.g. project status) |

## Confirmation rules (11A)

Migrated to `ConfirmDialog`:

- Professional project submit/resubmit
- Admin project approve
- Admin project reject

Not migrated yet: delete, deactivate user, media delete, etc.

## Representative migrations (11A)

1. `ProjectSubmitButton` — confirm + toast + loading
2. `ProjectReviewPanel` — approve/reject confirm + toast + loading on all actions
3. `ProjectMessageForm` — toast + loading
4. `CategoryForm` — FormField + toast + loading
5. `ProjectStatusBanner` — uses FeedbackBanner + StatusBadge
6. Notifications empty — EmptyState

## Legacy coexistence

- `AdminStatusBadge`, `form-section.module.scss`, `window.confirm` elsewhere remain until 11B+
- Inline `.formSuccess` banners on non-migrated forms unchanged

## Accessibility

- `focus-visible` on interactive elements
- Toast: `role="status"` / `aria-live="polite"`; errors `assertive`
- ConfirmDialog: native dialog focus + Escape
- Button loading: `aria-busy`, disabled while pending
- Form errors: `role="alert"`, `aria-invalid` on inputs

## Deferred (11B+)

- Full admin/professional form migration
- Table/card list unification
- Remaining `window.confirm` replacements
- Shell consolidation
- Public site primitive adoption
