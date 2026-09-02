import Link from "next/link";
import {
  buildProductWithProjectContextHref,
  type CatalogHrefInput,
} from "@/lib/catalog/catalog-params";
import CatalogProductImage from "@/components/catalog/CatalogProductImage";
import { ArrowRightIcon } from "@/components/Header/icons";
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

  const secondaryLine = product.brand || product.category;

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
      <div className={isCatalog ? styles.metaCatalog : styles.meta}>
        <div className={isCatalog ? styles.metaRow : undefined}>
          <div className={styles.metaText}>
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
            {isCatalog && secondaryLine ? (
              <span className={styles.secondaryCatalog}>{secondaryLine}</span>
            ) : null}
            {!isCatalog && product.category ? (
              <span className={styles.category}>{product.category}</span>
            ) : null}
            {!isCatalog && product.brand ? (
              <span className={styles.brand}>{product.brand}</span>
            ) : null}
          </div>
          {isCatalog ? <ArrowRightIcon className={styles.cardArrow} /> : null}
        </div>
      </div>
    </Link>
  );
}
