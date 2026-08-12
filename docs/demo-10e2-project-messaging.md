# Demo 10E.2 — Project Messaging

## Scope

Per-Project conversation between the Professional owner and Admin users. Messaging is embedded on project detail pages — not a site-wide chat.

## Domain separation

| Concept | Role |
|---|---|
| `reviewHistory` | Immutable workflow audit on Project |
| `Notification` | Professional inbox / attention record |
| `ProjectMessage` | Conversational thread inside a Project |

Sending a `ProjectMessage` must **not** modify Project status, append `reviewHistory`, or replace admin review feedback.

## ProjectMessage model

```ts
{
  projectId: ObjectId,
  senderUserId: ObjectId,
  senderRole: "professional" | "admin",
  audience: "professional" | "admin",
  body: string,              // plain text, max 4000
  readByUserIds: ObjectId[],
  createdAt: Date
}
```

Index: `{ projectId: 1, createdAt: -1 }`

Messages are immutable after creation. Only `readByUserIds` may change.

## Audience architecture

| Sender | `audience` | Readers |
|---|---|---|
| Admin | `professional` | Project owner |
| Professional | `admin` | Admin users (shared thread) |

Derived server-side from authenticated role — never from client input.

## Read state

`readByUserIds[]` with `$addToSet` on mark-read.

On create, seed `readByUserIds: [senderUserId]` so the sender never sees their own message as unread.

Unread query:

```ts
{
  projectId,
  audience: viewerAudience,
  readByUserIds: { $ne: currentUserId }
}
```

## Messaging availability

Gate: `hasEverBeenSubmitted(project)` — checks `reviewHistory` for `submitted` or `resubmitted` actions.

| Condition | Messaging |
|---|---|
| Never-submitted draft | Blocked |
| submitted / changes_requested / approved / rejected | Allowed |

Messaging remains available even when project content is read-only (`approved`/`rejected`).

## Authorization

| Actor | Access |
|---|---|
| Professional | Own project only |
| Admin | Any submitted project |
| Customer | Blocked |

Every Server Action re-validates independently of page route guards.

## Notifications

### Admin → Professional

Creates one `PROJECT_MESSAGE` notification for `Project.ownerUserId`.

Idempotency key:

```
project:{projectId}:message:{messageId}:recipient:{recipientUserId}
```

Href: `/professional/projects/{projectId}#messages`

### Professional → Admin

No Notification records. Admin discovers unread messages via project list badges.

## Failure semantics

Message insert is source of truth. Notification failure is logged server-side only — workflow/message is never rolled back.

## Unread counts

Both project list pages show per-project `"הודעות חדשות: N"` via a single aggregation per page load (no N+1):

- Professional: `audience: "professional"`, `readByUserIds: { $ne: ownerUserId }`
- Admin: `audience: "admin"`, `readByUserIds: { $ne: adminUserId }`

Professional nav notification badge remains driven by `Notification.isRead` — separate from message unread counts.

## Read marking

`ProjectMessageReadMarker` (client) calls role-specific mark-read Server Action on page open.

Notification read (`Notification.isRead`) and message read (`readByUserIds`) are separate concepts.

## Message limits

- Latest 50 messages displayed (oldest → newest)
- Truncation notice when total > 50
- No full history pagination in 10E.2

## Project lifecycle

- Messaging blocked on never-submitted drafts
- Post-submission projects cannot be deleted (10D rule)
- No cascade delete required — messages are tied to project lifetime

## Routes / UI

- `/professional/projects/[id]` — thread section `#messages`
- `/admin/projects/[id]` — thread section `#messages`
- `/professional/projects` — unread badge per project
- `/admin/projects` — unread badge per project

## Deferred

- `/admin/notifications` inbox
- Professional → Admin notification fan-out
- Message idempotency / `clientRequestId`
- Load-earlier pagination
- Attachments, rich text, edit/delete
- WebSockets, push, email/SMS
- Admin reviewer assignment
- Message search
