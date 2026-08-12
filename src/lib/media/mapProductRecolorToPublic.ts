import type { IProduct } from "@/models/Product";
import type { ProductRecolorView } from "@/types/product-media";
import { mapPrimaryImageToPublic } from "./mapProductMediaToPublic";

export function mapProductRecolorToPublic(
  product: Pick<IProduct, "media" | "recolorConfig" | "nameHe">,
): ProductRecolorView | null {
  const config = product.recolorConfig;
  const primary = product.media?.primaryImage;
  const mask = product.media?.recolorMask;

  if (
    !config?.enabled ||
    config.status !== "ready" ||
    !primary ||
    !mask ||
    !config.sourceImageMediaId ||
    config.sourceImageMediaId.toString() !== primary._id.toString()
  ) {
    return null;
  }

  const sourceImage = mapPrimaryImageToPublic(primary, product.nameHe);
  if (!sourceImage) {
    return null;
  }

  return {
    enabled: true,
    sourceImage,
    mask: {
      url: mask.url,
      width: mask.width,
      height: mask.height,
    },
  };
}
