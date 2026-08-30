import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function runPhase19bMigration(): Promise<void> {
  const { migratePhase19bCatalog } = await import(
    "@/lib/catalog/migrate-phase-19b-catalog"
  );

  const result = await migratePhase19bCatalog();

  console.log("Phase 19B catalog migration complete:");
  console.log(JSON.stringify(result, null, 2));
  console.log(
    "Note: products without supplierId were NOT backfilled with a fake supplier.",
  );
}

runPhase19bMigration()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("Phase 19B catalog migration failed:", error);
    process.exit(1);
  });
