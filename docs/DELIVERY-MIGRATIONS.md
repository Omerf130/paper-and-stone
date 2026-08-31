# Delivery — Database Migrations

Run these commands **only on legacy/non-greenfield databases** before client delivery.
Use `.env.local` with a valid `MONGODB_URI`.

## Required checks

1. **Account status (Phase 18C)** — if any users lack `accountStatus`:
   ```bash
   npm run migrate:18c-account-status
   ```

2. **Catalog / materials (Phase 19B)** — if materials predate variant model:
   ```bash
   npm run migrate:19b-catalog
   ```
   After run: manually assign `supplierId` on any products reported without a supplier.

3. **Pricing V2** — if projects use legacy per-item pricing fields:
   ```bash
   npm run migrate:pricing-v2
   ```

4. **Product media normalization** — if PDP images show inconsistent framing (e.g. Milano green gallery):
   ```bash
   npm run normalize:product-media -- --dry-run --product-slug milano-sofa --gallery
   npm run normalize:product-media -- --apply --product-slug milano-sofa --gallery
   ```

## Idempotency

- `migrate:18c-account-status` — safe to re-run
- `migrate:19b-catalog` — skips variant creation when already present; may still backfill names
- `migrate:pricing-v2` — safe to re-run (tested idempotency)
- `normalize:product-media` — inspect dry-run output before `--apply`

## Not required for greenfield

Fresh `npm run seed` environments typically need only seed + optional Milano media normalization if real blob assets were uploaded manually.

Payments and logistics use runtime schema defaults — no migration scripts.
