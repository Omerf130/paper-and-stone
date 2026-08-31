import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function runPricingV2Migration(): Promise<void> {
  const { migratePricingV2 } = await import("@/lib/pricing/migrate-pricing-v2");

  const result = await migratePricingV2();

  console.log("Pricing V2 migration complete:");
  console.log(JSON.stringify(result, null, 2));
}

runPricingV2Migration()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("Pricing V2 migration failed:", error);
    process.exit(1);
  });
