import Image from "next/image";
import type { PublicImageView } from "@/types/product-media";
import styles from "./ProductImage.module.scss";

type ProductImageProps = {
  image: PublicImageView;
  priority?: boolean;
  className?: string;
  sizes?: string;
  variant?: "default" | "hero";
};

export default function ProductImage({
  image,
  priority = false,
  className,
  sizes = "100vw",
  variant = "default",
}: ProductImageProps) {
  const width = image.width ?? 1200;
  const height = image.height ?? 900;

  const wrapClass =
    variant === "hero" ? styles.imageWrapHero : styles.imageWrap;
  const imageClass = variant === "hero" ? styles.imageHero : styles.image;
  const classes = className ? `${wrapClass} ${className}` : wrapClass;

  return (
    <div className={classes}>
      <Image
        src={image.url}
        alt={image.alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className={imageClass}
      />
    </div>
  );
}
