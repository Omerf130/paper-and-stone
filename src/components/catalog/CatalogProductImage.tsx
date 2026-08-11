import Image from "next/image";
import type { PublicImageView } from "@/types/product-media";
import styles from "./CatalogProductImage.module.scss";

type CatalogProductImageProps = {
  image: PublicImageView;
};

export default function CatalogProductImage({ image }: CatalogProductImageProps) {
  const width = image.width ?? 800;
  const height = image.height ?? 1000;

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
