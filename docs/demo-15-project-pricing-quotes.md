# Demo 15 — Project Pricing / Quotes

## Scope

Internal quote workflow for submitted projects:

- Dedicated `ProjectQuote` collection with versioning
- `Project.submissionRevision` binding quotes to submitted configuration
- Admin draft/save/send pricing workspace
- Professional view/accept/request-change
- Exclusive VAT at 18% (integer basis points)
- Professional `PROJECT_QUOTE_SENT` notifications
- Admin project-centric attention (dashboard, list, detail)
- Quote-gated final approval with legacy bypass

## Out of scope

PDF, payments, invoices, email/SMS, `/admin/notifications`, cron expiration, multi-currency, dedicated discount model, public/product pricing.

## Architecture

```
Project (workflow + items + submissionRevision)
ProjectQuote (commercial versions — separate collection)
ProjectMessage (conversation — unchanged)
Notification (professional quote events)
reviewHistory (status audit — unchanged)
```

## ProjectQuote lifecycle

`draft` → `sent` → `accepted` | `change_requested` → (new version) `sent`

`superseded` on resubmit, reject, request-changes, or new version.

Sent quotes are immutable. Version numbers are monotonic per project (1, 2, 3…).

## submissionRevision

- Default `0` on existing projects
- Incremented atomically on every submit/resubmit
- Every quote stores the revision it priced
- Accept/send/request-change validate revision compatibility
- Resubmit supersedes active quotes from old revisions

## Money

- All amounts stored as integer agorot
- Admin UI accepts shekel decimal input; server parses
- VAT: exclusive, 18% (`vatRateBasisPoints: 1800`) stored per quote
- Taxable base = product subtotal + additional lines (including negative discounts)
- Grand total = taxable base + VAT

## Legacy approval

- No quote ever sent → approve works as before
- Once any quote sent → latest quote for current revision must be `accepted` before `approveProject`

## UI slots

- Admin: `#project-pricing` between items and review (`AdminQuotePanel`)
- Professional: `#project-quote` between items and history (`ProfessionalQuoteSection`)

## Admin attention (no admin Notification records)

Dashboard + project list/detail surface:

- Quote accepted awaiting final approval
- Quote change requested
- Quote awaiting professional response

## Professional notifications

- `PROJECT_QUOTE_SENT` on send/revised send (idempotent per quoteId)

## Files

See implementation report in chat / git diff.
