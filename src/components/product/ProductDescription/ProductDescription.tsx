import Section from "@/components/Section/Section";
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
    <Section className={styles.section}>
      <div className={styles.content}>
        <h2 className={styles.heading}>על המוצר</h2>
        <p className={styles.text}>{product.longDescription}</p>
      </div>
    </Section>
  );
}
