import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import {
  departmentHasLandingContent,
  findDepartmentContext,
} from "@/lib/categories/collect-department-leaves";
import { getPublicCategoryNavTree } from "@/lib/categories/get-public-category-nav-tree";
import type { PublicCategoryNavDepartmentView } from "@/types/public-category-nav";
import type { CatalogParams } from "@/lib/catalog/catalog-params";

export type CatalogCategoryView =
  | { mode: "all-products" }
  | {
      mode: "department-landing";
      department: PublicCategoryNavDepartmentView;
    }
  | {
      mode: "leaf-products";
      categorySlug: string;
      departmentContext: {
        department: PublicCategoryNavDepartmentView;
      } | null;
    };

function hasProductLevelFilters(params: Pick<
  CatalogParams,
  "query" | "brand" | "material"
>): boolean {
  return Boolean(params.query || params.brand || params.material);
}

export async function resolveCatalogCategoryView(
  params: Pick<CatalogParams, "categorySlug" | "query" | "brand" | "material">,
): Promise<CatalogCategoryView> {
  const categorySlug = params.categorySlug?.trim() || null;

  if (!categorySlug) {
    return { mode: "all-products" };
  }

  if (hasProductLevelFilters(params)) {
    return {
      mode: "leaf-products",
      categorySlug,
      departmentContext: null,
    };
  }

  await connectDB();

  const category = await Category.findOne({ slug: categorySlug, isActive: true })
    .select("slug kind")
    .lean();

  if (!category) {
    return { mode: "all-products" };
  }

  const navTree = await getPublicCategoryNavTree();
  const departmentContext = findDepartmentContext(navTree.departments, categorySlug);

  if (category.kind === "department") {
    const department = navTree.departments.find((item) => item.slug === categorySlug);

    if (department && departmentHasLandingContent(department)) {
      return {
        mode: "department-landing",
        department,
      };
    }
  }

  return {
    mode: "leaf-products",
    categorySlug,
    departmentContext: departmentContext
      ? { department: departmentContext.department }
      : null,
  };
}
