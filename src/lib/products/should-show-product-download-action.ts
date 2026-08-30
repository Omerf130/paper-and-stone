import { getPublicProductDownloads } from "@/lib/products/get-public-product-downloads";
import type { ProductView } from "@/types/product";

export function shouldShowProductDownloadAction(
  product: Pick<ProductView, "documents">,
): boolean {
  return getPublicProductDownloads(product).length > 0;
}
