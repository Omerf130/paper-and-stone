import type { ProductRecolorView } from "@/types/product-media";
import type { ProductView } from "@/types/product";

export function shouldShowRecolorForImage(
  product: ProductView,
  selectedImageUrl: string | null,
  colorHex: string | null | undefined,
): product is ProductView & { recolor: ProductRecolorView } {
  if (!product.recolor?.enabled || !colorHex) {
    return false;
  }

  const activeUrl = selectedImageUrl ?? product.recolor.sourceImage.url;
  return activeUrl === product.recolor.sourceImage.url;
}
