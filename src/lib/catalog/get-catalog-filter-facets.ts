import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";
import { buildProductCatalogFilter } from "@/lib/catalog/build-product-catalog-filter";
import { resolveCategoryCatalogFilter } from "@/lib/catalog/resolve-active-category-slug";

export type CatalogFilterFacets = {
  brands: string[];
  materials: string[];
};

export async function getCatalogFilterFacets(input: {
  query?: string | null;
  categorySlug?: string | null;
}): Promise<CatalogFilterFacets> {
  await connectDB();

  const query = input.query?.trim() || null;
  const categoryFilter = await resolveCategoryCatalogFilter(
    input.categorySlug?.trim() || null,
  );

  const filter = buildProductCatalogFilter({
    query,
    categoryIds: categoryFilter.categoryIds,
  });

  const [brandResults, materialResults] = await Promise.all([
    Product.distinct("brand", {
      ...filter,
      brand: { $exists: true, $nin: [null, ""] },
    }),
    Product.distinct("materials", filter),
  ]);

  const brands = brandResults
    .filter((brand): brand is string => typeof brand === "string" && brand.trim().length > 0)
    .sort((left, right) => left.localeCompare(right, "he"));

  const materials = materialResults
    .filter(
      (material): material is string =>
        typeof material === "string" && material.trim().length > 0,
    )
    .sort((left, right) => left.localeCompare(right, "he"));

  return { brands, materials };
}
