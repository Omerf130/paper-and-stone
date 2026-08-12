# Demo 10E.1 — Notification Foundation

## Scope

In-app notifications for Professional users when Admin reviews a Project.

## Notification types

- `PROJECT_APPROVED`
- `PROJECT_REJECTED`
- `PROJECT_CHANGES_REQUESTED`

## Architecture

### Domain separation

| Concept | Role |
|---|---|
| `reviewHistory` | Immutable workflow audit on Project |
| `Notification` | Professional inbox / attention record |

`ProjectMessage` is deferred to Demo 10E.2.

### Review event identity

Before the atomic Project `updateOne`, the server generates:

```ts
const reviewEventId = createReviewEventId();
```

The same ID is embedded in the pushed `reviewHistory` subdocument (`_id`) and used for Notification idempotency. This preserves the verified 10D `updateOne` pattern without a read-back mutation.

### Consistency

1. Project transition succeeds (source of truth)
2. Post-transition idempotent Notification upsert
3. Notification failure is logged server-side only — workflow is never rolled back

Idempotency key:

```
project:{projectId}:review:{reviewHistoryId}:recipient:{recipientUserId}:type:{type}
```

### Admin submitted indicator

Not a Notification. Admin nav badge uses:

```ts
Project.countDocuments({ status: "submitted" })
```

## Routes

- `/professional/notifications` — inbox (20/page)
- ProfessionalShell top bar — unread count link

## Deferred to 10E.2

- ProjectMessage collection and thread UI
- Message notifications
- `/admin/notifications`
