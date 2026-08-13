import Container from "@/components/Container/Container";
import { hasProductDimensions } from "@/lib/products/product-display-helpers";
import type { ProductView } from "@/types/product";
import styles from "./TechnicalInfo.module.scss";

type TechnicalInfoProps = {
  product: ProductView;
};

export default function TechnicalInfo({ product }: TechnicalInfoProps) {
  const { dimensions } = product;
  const showDimensions = hasProductDimensions(dimensions);
  const hasMaterials = product.materials.length > 0;
  const hasMaintenance = product.maintenance.trim().length > 0;
  const hasWarranty = product.warranty.trim().length > 0;
  const hasCountry = product.countryOfOrigin.trim().length > 0;

  if (
    !showDimensions &&
    !hasMaterials &&
    !hasMaintenance &&
    !hasWarranty &&
    !hasCountry
  ) {
    return null;
  }

  return (
    <section className={styles.section} aria-labelledby="technical-info-heading">
      <Container variant="wide" className={styles.inner}>
        <h2 id="technical-info-heading" className={styles.heading}>
          מידע טכני
        </h2>

        <div className={styles.grid}>
          {showDimensions ? (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>מידות</h3>
              <dl className={styles.list}>
                {dimensions.width !== undefined ? (
                  <div className={styles.row}>
                    <dt>רוחב</dt>
                    <dd>{dimensions.width} ס&quot;מ</dd>
                  </div>
                ) : null}
                {dimensions.depth !== undefined ? (
                  <div className={styles.row}>
                    <dt>עומק</dt>
                    <dd>{dimensions.depth} ס&quot;מ</dd>
                  </div>
                ) : null}
                {dimensions.height !== undefined ? (
                  <div className={styles.row}>
                    <dt>גובה</dt>
                    <dd>{dimensions.height} ס&quot;מ</dd>
                  </div>
                ) : null}
                {dimensions.seatHeight !== undefined ? (
                  <div className={styles.row}>
                    <dt>גובה מושב</dt>
                    <dd>{dimensions.seatHeight} ס&quot;מ</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          ) : null}

          {hasMaterials ? (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>חומרים</h3>
              <ul className={styles.materials}>
                {product.materials.map((material) => (
                  <li key={material}>{material}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {hasMaintenance ? (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>תחזוקה</h3>
              <p className={styles.text}>{product.maintenance}</p>
            </div>
          ) : null}

          {hasWarranty ? (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>אחריות</h3>
              <p className={styles.text}>{product.warranty}</p>
            </div>
          ) : null}

          {hasCountry ? (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>ארץ ייצור</h3>
              <p className={styles.text}>{product.countryOfOrigin}</p>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
