import ProductDownloadButton from "@/components/product/ProductDownloadButton/ProductDownloadButton";
import ProductWishlistButton from "@/components/product/ProductWishlistButton/ProductWishlistButton";
import type { ProductView } from "@/types/product";
import styles from "./ProductPdpHeader.module.scss";

type ProductPdpHeaderProps = {
  product: ProductView;
  isWishlisted: boolean;
  isAuthenticated: boolean;
  loginHref?: string;
};

export default function ProductPdpHeader({
  product,
  isWishlisted,
  isAuthenticated,
  loginHref,
}: ProductPdpHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.identity}>
        {product.category ? (
          <p className={styles.category}>{product.category}</p>
        ) : null}
        <h1 className={styles.name}>{product.nameHe}</h1>
        {product.sku ? (
          <p className={styles.sku} dir="ltr">
            {product.sku}
          </p>
        ) : null}
      </div>

      <div className={styles.actions}>
        <ProductWishlistButton
          productSlug={product.slug}
          initialIsWishlisted={isWishlisted}
          isAuthenticated={isAuthenticated}
          loginHref={loginHref}
        />
        <ProductDownloadButton product={product} />
      </div>
    </header>
  );
}
