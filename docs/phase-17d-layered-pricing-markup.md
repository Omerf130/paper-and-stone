# Phase 17D — Layered Pricing + Markup

Phase 17D introduces three-tier item-level pricing for new onboarding-workflow Projects, while legacy Projects continue using ProjectQuote unchanged.

## Pricing layers

| Layer | Visible to | Controlled by |
|-------|------------|---------------|
| Internal cost (`internalCostAgorot`) | Admin | Admin |
| Admin markup → Architect price | Admin, Architect (price only) | Admin |
| Architect markup → Client price | Admin, Architect, future Client | Architect |

## Money & markup

- All amounts stored as **integer agorot**
- Markup stored as **basis points** (20% = 2000 bp, max 1000%)
- Formulas (server-authoritative):

```
architectPrice = round(internalCost * (10000 + adminMarkupBp) / 10000)
clientPrice    = round(architectPrice * (10000 + architectMarkupBp) / 10000)
```

## Product default internal cost

- Optional `Product.defaultInternalCostAgorot` (Admin-only)
- Snapshotted onto **new** Project Items at add time
- Product cost changes affect **future** items only
- **No backfill** for pre-17D items — Admin enters cost explicitly

## Project defaults & overrides

- `Project.defaultAdminMarkupBp` — Admin sets; applies to items without item-level admin markup override
- `Project.defaultArchitectMarkupBp` — Architect sets; applies to items without architect markup override
- Item overrides stored only when explicitly set (`adminMarkupBp`, `architectMarkupBp`)

## Stale client price (locked)

**Admin repricing** when client price already exists:
- Recalculate architect price
- **Preserve** client price
- Set `clientPriceStale = true`

**Architect repricing** (item or project default markup change):
- Recalculate client price from current architect price
- Set `clientPriceStale = false`
- Update audit fields + increment `priceVersion`

## Legacy compatibility

- `usesLayeredPricing(project)` = `usesRoomBasedWorkspace(project)`
- Legacy projects (`onboardingStatus == null`) → ProjectQuote workflow unchanged
- Layered pricing UI replaces quote panels for room-based projects

## Commercial gates (new workflow)

Submit requires all items have architect + client prices and no stale client prices.

Approval uses layered pricing completeness gate instead of accepted ProjectQuote.

## Pricing editability (new workflow)

Pricing is an ongoing workspace capability, separate from commercial review status:

- **Admin pricing** is available whenever `onboardingStatus === "active"` (including `submitted` and `approved`)
- **Architect pricing** follows workspace editability: `draft`, `changes_requested`, and `approved` — but not while `submitted` (review lock)
- Submit/approval completeness gates apply only when sending for review, not when accessing pricing tools

**Deferred:** re-submit from `approved` after post-approval commercial changes (requires status transition or dirty flag — follow-up subphase).

## Deferred (Phase 17E+)

- Client Dashboard / client project pages
- Architect↔Client messaging
- Exposing stale client prices to Client
- Configuration-specific pricing
- Full pricing audit history

See also: [`docs/phase-17c-rooms-product-workspace.md`](phase-17c-rooms-product-workspace.md)
