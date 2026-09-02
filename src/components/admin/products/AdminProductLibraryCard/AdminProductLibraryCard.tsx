import Link from "next/link";
import ProductRowActions from "@/components/admin/ProductRowActions/ProductRowActions";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import type { ProductThumbnailView } from "@/lib/products/loadProductThumbnailMap";
import { formatDateTime } from "@/lib/ui/format-date-time";
import {
  mapEntityActiveToBadge,
  mapProductFeaturedToBadge,
} from "@/lib/ui/map-status-badge";
import type { AdminProductListItem } from "@/types/admin-product";
import styles from "./AdminProductLibraryCard.module.scss";

type AdminProductLibraryCardProps = {
  product: AdminProductListItem;
  thumbnail?: ProductThumbnailView;
};

function ProductPlaceholderIcon() {
  return (
    <svg
      className={styles.placeholderIcon}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect x="4" y="6" width="16" height="12" rx="1.5" stroke="currentColor" strokeWidth="1" />
      <path
        d="M8 14l2.5-2.5L14 15l2-2 2 2"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AdminProductLibraryCard({
  product,
  thumbnail,
}: AdminProductLibraryCardProps) {
  const activeStatus = mapEntityActiveToBadge(product.isActive);
  const featuredStatus = mapProductFeaturedToBadge(product.isFeatured);

  return (
    <article className={styles.card}>
      <Link href={`/admin/products/${product.id}`} className={styles.mediaLink}>
        <div className={styles.media}>
          {thumbnail?.url ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin library uses known media URLs
            <img
              src={thumbnail.url}
              alt={thumbnail.altText || product.nameHe}
              className={styles.mediaImage}
            />
          ) : (
            <span className={styles.placeholder} aria-hidden="true">
              <ProductPlaceholderIcon />
            </span>
          )}
        </div>
      </Link>

      <div className={styles.body}>
        <Link href={`/admin/products/${product.id}`} className={styles.nameLink}>
          <h2 className={styles.name}>{product.nameHe}</h2>
        </Link>

        <p className={styles.category}>{product.categoryName}</p>

        {product.supplierName ? (
          <p className={styles.supplier}>{product.supplierName}</p>
        ) : null}

        <p className={styles.sku} dir="ltr">
          {product.sku}
        </p>

        <div className={styles.footer}>
          <div className={styles.footerStart}>
            <div className={styles.badges}>
              <StatusBadge tone={activeStatus.tone}>{activeStatus.label}</StatusBadge>
              {product.isFeatured ? (
                <StatusBadge tone={featuredStatus.tone}>{featuredStatus.label}</StatusBadge>
              ) : null}
            </div>
            <p className={styles.updated}>{formatDateTime(product.updatedAt)}</p>
          </div>
          <ProductRowActions product={product} layout="card" />
        </div>
      </div>
    </article>
  );
}
