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

4. **Category taxonomy** — if categories predate the department/group/leaf structure:
   ```bash
   npm run migrate:category-taxonomy
   ```
   Maps existing `sofas` slug into Living → Seating → Sofas. Safe to re-run.

## Idempotency

- `migrate:18c-account-status` — safe to re-run
- `migrate:19b-catalog` — skips variant creation when already present; may still backfill names
- `migrate:pricing-v2` — safe to re-run (tested idempotency)
- `migrate:category-taxonomy` — safe to re-run; upserts predefined taxonomy and maps legacy slugs

## Product media recovery

Admin product uploads are stored as the original image bytes (no automatic normalization). If a product image was damaged by an earlier normalization pass, re-upload the original source file through Admin → Product → Media.

## Not required for greenfield

Fresh `npm run seed` environments typically need only seed.

Payments and logistics use runtime schema defaults — no migration scripts.
