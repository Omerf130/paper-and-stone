import {
  backfillSkuNormalized,
  ensureSkuNormalizedUniqueIndex,
  inspectSkuNormalizedCollisions,
} from "@/lib/products/sku-normalized-backfill";

async function runBackfillSkuNormalized17c(): Promise<void> {
  const collisions = await inspectSkuNormalizedCollisions();

  if (collisions.length > 0) {
    console.error("SKU normalized collisions detected — aborting backfill:");
    console.error(JSON.stringify(collisions, null, 2));
    process.exit(1);
  }

  const result = await backfillSkuNormalized();

  if (result.status === "collisions") {
    console.error("SKU normalized collisions detected during backfill:");
    console.error(JSON.stringify(result.collisions, null, 2));
    process.exit(1);
  }

  await ensureSkuNormalizedUniqueIndex();

  console.log("Phase 17C SKU normalized backfill complete:");
  console.log(`  backfilled: ${result.backfilledCount}`);
  console.log("  unique index: skuNormalized_unique");
}

runBackfillSkuNormalized17c()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("Phase 17C SKU normalized backfill failed:", error);
    process.exit(1);
  });
