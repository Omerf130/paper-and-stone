import Link from "next/link";
import type {
  AdminDashboardRecentProduct,
} from "@/types/admin-dashboard";
import type { ProductThumbnailView } from "@/lib/products/loadProductThumbnailMap";
import styles from "./AdminDashboardRecentProducts.module.scss";

type AdminDashboardRecentProductsProps = {
  products: AdminDashboardRecentProduct[];
  productThumbnailsById: Record<string, ProductThumbnailView>;
};

export default function AdminDashboardRecentProducts({
  products,
  productThumbnailsById,
}: AdminDashboardRecentProductsProps) {
  return (
    <section className={styles.section} aria-labelledby="dashboard-products-title">
      <div className={styles.header}>
        <h2 id="dashboard-products-title" className={styles.title}>
          מוצרים שעודכנו לאחרונה
        </h2>
        <Link href="/admin/products" className={styles.viewAll}>
          צפייה בקטלוג →
        </Link>
      </div>

      {products.length === 0 ? (
        <p className={styles.empty}>אין מוצרים להצגה</p>
      ) : (
        <ul className={styles.strip}>
          {products.map((product) => {
            const thumbnail = productThumbnailsById[product.id];

            return (
              <li key={product.id}>
                <Link
                  href={`/admin/products/${product.id}`}
                  className={styles.tile}
                >
                  <span className={styles.imageWrap}>
                    {thumbnail?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- admin dashboard uses known media URLs
                      <img
                        src={thumbnail.url}
                        alt={thumbnail.altText || product.nameHe}
                        className={styles.image}
                      />
                    ) : (
                      <span className={styles.imagePlaceholder} aria-hidden="true" />
                    )}
                  </span>
                  <span className={styles.name}>{product.nameHe}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
