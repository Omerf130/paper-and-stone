# Phase 17F — Architect ↔ Client Project Messaging

## Purpose

Phase 17F adds a separate **architect_client** conversation domain on top of the existing **admin_architect** project messaging. Architects and assigned Clients can exchange messages per project; Admins can read the architect–client thread without affecting read state.

## Conversation domains

| Domain | `conversationType` | Participants | Read marking |
|--------|---------------------|--------------|--------------|
| Admin ↔ Architect | `admin_architect` (legacy messages without field normalize here) | Admin, Professional/Architect | Existing behavior unchanged |
| Architect ↔ Client | `architect_client` | Architect, assigned Client | `readByUserIds[]` per message |

Legacy messages without `conversationType` are treated as `admin_architect` via `normalizeProjectConversationType()`.

## Schema

`ProjectMessage` extensions:

- `conversationType`: `"admin_architect" | "architect_client"`
- `clientUserIdAtSend`: required for `architect_client` — scopes thread after client reassignment
- Extended `senderRole` / `audience`: `architect`, `client`
- Index: `{ projectId, conversationType, clientUserIdAtSend, createdAt }`

## Access rules

| Role | Send | Read thread | Mark read |
|------|------|-------------|-----------|
| Architect (project owner) | To assigned active Client | Current assignment only | Messages with `audience: "architect"` |
| Client | When `Project.clientUserId` matches session | Current assignment only | Messages with `audience: "client"` |
| Admin | Admin↔Architect only | Both threads | Admin↔Architect only; architect–client is read-only |

Architect cannot send to inactive/unassigned clients. Client messaging is available whenever assigned (same visibility rule as 17E-B — not gated on onboarding or snapshot).

## Unread indicators

Batched aggregation (no N+1):

- `getUnreadArchitectClientMessageCountsForProjects(assignments, architectUserId)` — architect project cards
- `getUnreadClientArchitectMessageCountsForProjects(projectIds, clientUserId)` — client project cards

Labels via `formatUnreadMessageLabel()`: "הודעה חדשה" / "X הודעות חדשות".

Reassignment: counts filter by `clientUserIdAtSend` matching the project's current `clientUserId`, so prior-client messages do not appear in the new client's unread totals.

## UI surfaces

| Surface | Section |
|---------|---------|
| `/professional/projects/[id]` | "שיחה עם האדמין" + "שיחה עם הלקוח" |
| `/client/projects/[id]` | "שיחה עם האדריכל" (with or without approved snapshot) |
| `/admin/projects/[id]` | "שיחה עם האדמין" + read-only "שיחת אדריכל ולקוח" |

Shared thread component: `ProjectConversationThread`. Admin↔Architect continues to use `ProjectMessageThread`.

## Key modules

- `src/lib/project-messages/architect-client-messages.ts` — fetch + mark read
- `src/lib/project-messages/createArchitectClientProjectMessage.ts` — send mutations
- `src/lib/project-messages/verifyArchitectClientMessagingAccess.ts` — access checks
- `src/app/professional/projects/architect-client-message-actions.ts` — server actions
- `src/components/project-messages/ProjectConversationThread/` — UI

## Out of scope (17G+)

- Global notification expansion for architect–client messages
- Email/push delivery
- Attachments or rich content
