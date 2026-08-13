import Image from "next/image";
import type { PublicImageView } from "@/types/product-media";
import styles from "./CatalogProductImage.module.scss";

export type CatalogProductImageVariant = "default" | "catalog" | "featured";

type CatalogProductImageProps = {
  image: PublicImageView;
  variant?: CatalogProductImageVariant;
};

export default function CatalogProductImage({
  image,
  variant = "default",
}: CatalogProductImageProps) {
  const width = image.width ?? 800;
  const height = image.height ?? 1000;

  if (variant === "catalog") {
    return (
      <div className={styles.imageWrapCatalog}>
        <Image
          src={image.url}
          alt={image.alt}
          width={width}
          height={height}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className={styles.imageCatalog}
        />
      </div>
    );
  }

  if (variant === "featured") {
    return (
      <div className={styles.imageWrapFeatured}>
        <Image
          src={image.url}
          alt={image.alt}
          width={width}
          height={height}
          sizes="(max-width: 768px) 100vw, 50vw"
          className={styles.imageFeatured}
        />
      </div>
    );
  }

  return (
    <div className={styles.imageWrap}>
      <Image
        src={image.url}
        alt={image.alt}
        width={width}
        height={height}
        sizes="(max-width: 768px) 100vw, (max-width: 1440px) 50vw, 33vw"
        className={styles.image}
      />
    </div>
  );
}
