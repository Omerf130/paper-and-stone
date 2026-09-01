import ProductImage from "@/components/product/ProductImage/ProductImage";
import type { PublicImageView } from "@/types/product-media";

type ProductStageImageProps = {
  image: PublicImageView;
  priority?: boolean;
};

export default function ProductStageImage({
  image,
  priority = false,
}: ProductStageImageProps) {
  return (
    <ProductImage
      image={image}
      variant="hero"
      priority={priority}
      sizes="(min-width: 1024px) 58vw, 100vw"
    />
  );
}
