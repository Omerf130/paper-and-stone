import { connectDB } from "@/lib/db/mongoose";
import {
  buildAdminProjectSearchOrClause,
  resolveAdminProjectSearchMatchIds,
} from "@/lib/projects/admin-project-search";
import { buildAdminProductsFilter } from "@/lib/products/getAdminProducts";
import Product from "@/models/Product";
import Project from "@/models/Project";

const DEFAULT_LIMIT = 5;
const MIN_QUERY_LENGTH = 2;

export type AdminGlobalSearchProjectResult = {
  id: string;
  name: string;
  location?: string;
};

export type AdminGlobalSearchProductResult = {
  id: string;
  nameHe: string;
  sku: string;
};

export type AdminGlobalSearchResult = {
  projects: AdminGlobalSearchProjectResult[];
  products: AdminGlobalSearchProductResult[];
};

export async function searchAdminGlobal(
  rawQuery: string,
  limit = DEFAULT_LIMIT,
): Promise<AdminGlobalSearchResult> {
  const query = rawQuery.trim();

  if (query.length < MIN_QUERY_LENGTH) {
    return { projects: [], products: [] };
  }

  await connectDB();

  const { ownerUserIds, clientUserIds } =
    await resolveAdminProjectSearchMatchIds(query);
  const projectFilter = buildAdminProjectSearchOrClause({
    query,
    ownerUserIds,
    clientUserIds,
  });
  const productFilter = buildAdminProductsFilter({
    query,
    visibility: null,
    categoryId: null,
    supplierId: null,
    featured: null,
  });

  const [projects, products] = await Promise.all([
    Project.find(projectFilter)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select("name location")
      .lean(),
    Product.find(productFilter)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select("nameHe sku")
      .lean(),
  ]);

  return {
    projects: projects.map((project) => ({
      id: project._id.toString(),
      name: project.name,
      location: project.location?.trim() || undefined,
    })),
    products: products.map((product) => ({
      id: product._id.toString(),
      nameHe: product.nameHe,
      sku: product.sku,
    })),
  };
}
