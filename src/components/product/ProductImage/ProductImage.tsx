import Image from "next/image";
import type { PublicImageView } from "@/types/product-media";
import styles from "./ProductImage.module.scss";

type ProductImageProps = {
  image: PublicImageView;
  priority?: boolean;
  className?: string;
  sizes?: string;
};

export default function ProductImage({
  image,
  priority = false,
  className,
  sizes = "100vw",
}: ProductImageProps) {
  const width = image.width ?? 1200;
  const height = image.height ?? 900;

  const classes = className
    ? `${styles.imageWrap} ${className}`
    : styles.imageWrap;

  return (
    <div className={classes}>
      <Image
        src={image.url}
        alt={image.alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className={styles.image}
      />
    </div>
  );
}
