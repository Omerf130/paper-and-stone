import type { ProductView } from "@/types/product";
import type { PublicProductDocumentView } from "@/types/product-document";

export type PublicProductDownload = PublicProductDocumentView;

export function getPublicProductDownloads(
  product: Pick<ProductView, "documents">,
): PublicProductDownload[] {
  return product.documents;
}
