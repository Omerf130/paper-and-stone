import Container from "@/components/Container/Container";
import type { ProductView } from "@/types/product";
import styles from "./ProductDescription.module.scss";

type ProductDescriptionProps = {
  product: ProductView;
};

export default function ProductDescription({
  product,
}: ProductDescriptionProps) {
  if (!product.longDescription.trim()) {
    return null;
  }

  return (
    <section className={styles.section} aria-labelledby="product-description-heading">
      <Container variant="wide" className={styles.inner}>
        <div className={styles.content}>
          <h2 id="product-description-heading" className={styles.heading}>
            על המוצר
          </h2>
          <p className={styles.text}>{product.longDescription}</p>
        </div>
      </Container>
    </section>
  );
}
