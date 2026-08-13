import ProductMetaList from "@/components/product/ProductMetaList/ProductMetaList";
import type { ProductView } from "@/types/product";
import styles from "./ProductInfo.module.scss";

type ProductInfoProps = {
  product: ProductView;
};

export default function ProductInfo({ product }: ProductInfoProps) {
  const metaItems = [
    ...(product.brand.trim().length > 0
      ? [{ term: "מותג", value: product.brand }]
      : []),
    ...(product.designer.trim().length > 0
      ? [{ term: "מעצב", value: product.designer }]
      : []),
  ];

  return (
    <header className={styles.info}>
      {product.category ? (
        <p className={styles.category}>{product.category}</p>
      ) : null}
      <h1 className={styles.name}>{product.nameHe}</h1>
      {product.name ? <p className={styles.nameEn}>{product.name}</p> : null}
      <ProductMetaList items={metaItems} />
      {product.shortDescription ? (
        <p className={styles.description}>{product.shortDescription}</p>
      ) : null}
    </header>
  );
}
