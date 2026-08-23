# Phase 18A — Project Item Status Workflow Foundation

Per-item workflow status for Products inside Projects, independent of Project commercial/onboarding/pricing state.

## Two separate visibility concepts

**Do not conflate these:**

| Concept | Governs | Mechanism |
|---------|---------|-----------|
| **Snapshot membership** | Whether commercial Product content is visible to Client | `ClientApprovedProjectSnapshot` — frozen at commercial approval |
| **Project Item status** | Live operational workflow state | `Project.items[].status` on live Project document |

### Client commercial visibility

- Client sees Product **content** (image, configuration, approved client price) only from `ClientApprovedProjectSnapshot`.
- A live Product **not in the snapshot** remains **invisible to Client** regardless of its status — including `hidden`.
- **`hidden` is an operational status only.** It does **not** replace, bypass, or compete with snapshot-based Client visibility.
- **No second Client visibility system** was introduced in 18A.

### Live status overlay (18A foundation)

For snapshot items only, Client workflow queries resolve **live status** by `snapshot.projectItemId` → `Project.items[]._id`:

- Safe fields: `projectItemId`, `status`, `allowedTargetStatuses`, `presentation`
- Never exposes: pricing, configuration, snapshot internals, other live item fields

## Status set (9 statuses)

| Status | Hebrew (Admin/Architect) | Client presentation |
|--------|--------------------------|---------------------|
| `draft` | טיוטה | בתהליך (internal) |
| `hidden` | מוסתר | not shown via status layer |
| `quoting` | בתמחור | internal |
| `selected` | נבחר | internal |
| `internal_review` | בדיקה פנימית | בתהליך |
| `client_review` | ממתין לאישור לקוח | ממתין לאישור שלך |
| `client_approved` | אושר על ידי הלקוח | אושר |
| `client_rejected` | נדחה על ידי הלקוח | נדחה |
| `resubmit` | נדרש להגשה מחדש | internal |

Colors/tones: centralized in `getProjectItemStatusPresentation()` — not stored on items.

## Schema changes

On each `Project.items[]` entry:

```typescript
status: ProjectItemStatus          // default "draft" for new workflow items
statusHistory: [{
  from, to, changedByUserId, changedByRole, changedAt
}]
```

## Legacy compatibility

- Existing items without `status` normalize to `draft` in mappers (`normalizeProjectItemStatus`).
- No destructive migration — read-time normalization only.
- Legacy projects (`onboardingStatus == null`) still omit status on create; normalize on read if present.

## Workflow settings

Singleton: `ProjectItemWorkflowSettings` with `key: "project-item-workflow"`.

Shape:

```typescript
{
  transitions: [
    { from: "client_review", to: "client_approved", allowedRoles: ["client"] }
  ]
}
```

- Admin UI: `/admin/settings/project-item-workflow`
- Defaults used when no DB document exists
- Admin override: may set **any** known status directly (history recorded)
- Architect/Client: must follow configured transitions (server-enforced)

## Authorization

| Role | Requirements |
|------|--------------|
| Admin | `requireAdmin()` — override any status |
| Architect | `Project.ownerUserId === userId` + allowed transition |
| Client | `Project.clientUserId === userId` + allowed transition |

## commercialDirty

**Workflow-only status changes do NOT set `commercialDirty`.** Status is metadata; approved commercial content unchanged.

## Pricing / snapshot

- Status mutation does not touch pricing fields.
- `ClientApprovedProjectSnapshot` is not rewritten on status change.

## Revalidation

After status mutation: revalidate Admin, Architect, and Client project detail paths. No WebSockets in 18A.

## Implementation map

| Area | Location |
|------|----------|
| Types | `src/types/project-item-status.ts` |
| Schema | `src/models/Project.ts` |
| Settings model | `src/models/ProjectItemWorkflowSettings.ts` |
| Transition engine | `src/lib/project-items/project-item-status-transition.ts` |
| Mutation | `src/lib/project-items/set-project-item-status.ts` |
| Presentation | `src/lib/project-items/project-item-status-presentation.ts` |
| Client-safe query | `src/lib/client-projects/getClientProjectItemWorkflowStatuses.ts` |
| Admin UI | `AdminProjectItemStatusControl`, settings form |
| Architect UI | `ArchitectProjectItemStatusControl`, `ProjectItemStatusBadge` |

## Deferred

| Phase | Scope |
|-------|-------|
| **18B** | Full Client approval/rejection UI; Architect card polish; status history display; admin filters |
| **18C** | Client registration pending Admin approval |
| **18D** | Full catalog product-add flow; remove modal picker |
