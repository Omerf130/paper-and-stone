# Admin Project Pricing Round Workflow

Corrective workflow for layered-pricing projects: admin pricing rounds, delivery to the architect, and visibility across admin and architect surfaces.

## Scope

- **Layered-pricing projects only** (`onboardingStatus: "active"` with room workspace). Legacy `ProjectQuote` projects are unchanged.
- **Project-level delivery** — one admin action per pricing round, not per item.

## Revision fields

| Field | Meaning |
| --- | --- |
| `adminPricingRevision` | Current open pricing round (increments when work starts after last delivery) |
| `adminPricingDeliveredRevision` | Last revision delivered to the architect |
| `architectAdminPricingSeenRevision` | Last delivered revision the architect has opened |

Derived:

- `hasPendingAdminPricingDelivery` = `adminPricingRevision > adminPricingDeliveredRevision`
- Open a new round only when `adminPricingRevision === adminPricingDeliveredRevision` (delivered caught up)

## Opening a round

A round opens (increments `adminPricingRevision`) when:

1. Architect adds a product or changes quantity/configuration after delivery caught up, or
2. Admin reprices an item after delivery caught up.

Post-commercial-approval example: delivered revision `2` → architect adds product → revision `3`, delivered stays `2` → pending delivery → admin prices → delivery button appears again.

## Admin layer vs full pricing

Admin delivery completeness uses **admin layer only**:

- `internalCostAgorot` + `architectPriceAgorot` per item

Client price is **not** required for delivery. Architect submit still requires full layered pricing including client prices.

## Admin delivery

- Action: **אישור תמחור ושליחה לאדריכל**
- Enabled when pending delivery and all items have admin-layer pricing complete
- Sets `adminPricingDeliveredRevision = adminPricingRevision`
- Appends review history action `admin_pricing_delivered`
- Does **not** clear `clientPriceStale`

## Gates

| Action | Blocked when |
| --- | --- |
| Architect commercial submit | Pending admin delivery; incomplete admin layer; incomplete/stale client pricing |
| Admin commercial approval | Pending admin delivery; incomplete admin layer; incomplete/stale client pricing |

## Admin list visibility

Queue tabs (order): **כל הפרויקטים**, **דורש טיפול** (default), **פעילים**, **ממתינים לבדיקה**, **ממתינים לאישור פתיחה**.

- **כל הפרויקטים** — no filter; search/pagination preserved
- **פעילים** — `{ onboardingStatus: "active" }` (includes approved empty projects)
- **דורש טיפול** — pending onboarding, submitted commercial review, pending admin pricing delivery, stale client prices

Attention reasons for pricing rounds:

- `admin_pricing_incomplete` — pending round, missing admin-layer fields
- `pricing_ready_to_deliver` — pending round, ready to send

## Architect UX

- Banner on project detail when `adminPricingDeliveredRevision > architectAdminPricingSeenRevision`
- Opening the project acknowledges seen revision (`architectAdminPricingSeenRevision = adminPricingDeliveredRevision`)

## Implementation map

| Area | Location |
| --- | --- |
| Round helpers | `src/lib/pricing/admin-pricing-round.ts` |
| Delivery mutation | `src/lib/pricing/deliver-admin-pricing-round.ts` |
| Architect seen ack | `src/lib/pricing/acknowledge-architect-admin-pricing-seen.ts` |
| Presentation | `src/lib/pricing/admin-pricing-round-presentation.ts` |
| Server action | `src/app/admin/projects/pricing-delivery-actions.ts` |
| Admin UI | `AdminPricingDeliveryPanel`, `AdminProjectWorkspace` |
| Architect UI | `ArchitectAdminPricingBanner`, professional project page |
