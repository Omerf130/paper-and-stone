import type { ProductThumbnailView } from "@/lib/products/loadProductThumbnailMap";
import type { AdminProductListItem } from "@/types/admin-product";
import AdminProductLibraryCard from "../AdminProductLibraryCard/AdminProductLibraryCard";
import styles from "./AdminProductLibraryGrid.module.scss";

type AdminProductLibraryGridProps = {
  products: AdminProductListItem[];
  thumbnailsByProductId: Record<string, ProductThumbnailView>;
};

export default function AdminProductLibraryGrid({
  products,
  thumbnailsByProductId,
}: AdminProductLibraryGridProps) {
  return (
    <ul className={styles.grid}>
      {products.map((product) => (
        <li key={product.id} className={styles.item}>
          <AdminProductLibraryCard
            product={product}
            thumbnail={thumbnailsByProductId[product.id]}
          />
        </li>
      ))}
    </ul>
  );
}
