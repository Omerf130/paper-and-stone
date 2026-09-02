import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function runCategoryTaxonomyMigration(): Promise<void> {
  const { ensureCatalogTaxonomy } = await import(
    "@/lib/categories/ensure-catalog-taxonomy"
  );

  const result = await ensureCatalogTaxonomy();

  console.log("Category taxonomy migration complete:");
  console.log(JSON.stringify(result, null, 2));
}

runCategoryTaxonomyMigration()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("Category taxonomy migration failed:", error);
    process.exit(1);
  });
