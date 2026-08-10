import type { ICategory } from "@/models/Category";
import type { IProduct } from "@/models/Product";
import type { CatalogProductView } from "@/types/catalog";

type LeanCatalogProduct = Pick<
  IProduct,
  "slug" | "nameHe" | "nameEn" | "brand"
> & {
  categoryId: Pick<ICategory, "nameHe"> | null;
};

export function mapProductToCatalogView(
  product: LeanCatalogProduct,
): CatalogProductView {
  return {
    slug: product.slug,
    nameHe: product.nameHe,
    nameEn: product.nameEn,
    category: product.categoryId?.nameHe ?? "",
    brand: product.brand,
  };
}
