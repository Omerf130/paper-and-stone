import Link from "next/link";
import {
  buildProductWithProjectContextHref,
  type CatalogHrefInput,
} from "@/lib/catalog/catalog-params";
import CatalogProductImage from "@/components/catalog/CatalogProductImage";
import VisualPlaceholder from "@/components/VisualPlaceholder/VisualPlaceholder";
import type { CatalogProductView } from "@/types/catalog";
import styles from "./ProductCard.module.scss";

export type ProductCardVariant = "default" | "catalog" | "featured";

type ProductCardProps = {
  product: CatalogProductView;
  variant?: ProductCardVariant;
  hrefInput?: CatalogHrefInput;
};

export default function ProductCard({
  product,
  variant = "default",
  hrefInput,
}: ProductCardProps) {
  const isCatalog = variant === "catalog";
  const isFeatured = variant === "featured";
  const linkClass = isCatalog
    ? styles.linkCatalog
    : isFeatured
      ? styles.linkFeatured
      : styles.link;
  const imageVariant = isCatalog ? "catalog" : isFeatured ? "featured" : "default";
  const href = hrefInput
    ? buildProductWithProjectContextHref(product.slug, hrefInput)
    : `/products/${product.slug}`;

  return (
    <Link href={href} className={linkClass}>
      <div
        className={
          isCatalog
            ? styles.mediaCatalog
            : isFeatured
              ? styles.mediaFeatured
              : undefined
        }
      >
        {product.primaryImage ? (
          <CatalogProductImage
            image={product.primaryImage}
            variant={imageVariant}
          />
        ) : (
          <VisualPlaceholder
            aspectRatio="portrait"
            className={styles.placeholder}
          />
        )}
      </div>
      <div className={styles.meta}>
        <span
          className={
            isCatalog
              ? styles.nameCatalog
              : isFeatured
                ? styles.nameFeatured
                : styles.name
          }
        >
          {product.nameHe}
        </span>
        {product.category ? (
          <span className={styles.category}>{product.category}</span>
        ) : null}
        {product.brand ? (
          <span className={styles.brand}>{product.brand}</span>
        ) : null}
      </div>
    </Link>
  );
}
