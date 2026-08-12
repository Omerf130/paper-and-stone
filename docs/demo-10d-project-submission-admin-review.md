# Demo 10D — Project Submission + Admin Review

## Scope

- Professional submit/resubmit workflow
- Admin approve / request changes / reject
- Append-only `reviewHistory`
- Admin projects list + detail (read-only content)
- Professional status/feedback UX

## Out of scope (Demo 10E)

- Notifications
- ProjectMessage chat
- Pricing

## Status machine

```
draft → submitted (professional)
changes_requested → submitted (professional resubmit; preserves reviewedAt/reviewedByUserId)
submitted → approved | changes_requested | rejected (admin)
approved/rejected → final read-only
```

## Rules

- No generic client-controlled status updates
- Status transition + `$push reviewHistory` in one atomic update
- `reviewHistory` is append-only (no edit/delete/replace APIs)
- Delete only when `draft` and never submitted
- Submit requires ≥1 item; stale/inactive items allowed
- Request changes requires message; reject requires reason; approve note optional
