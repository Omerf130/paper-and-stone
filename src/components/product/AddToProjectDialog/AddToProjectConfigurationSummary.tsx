import type { AddToProjectConfigurationView } from "@/lib/products/build-add-to-project-configuration-view";
import styles from "./AddToProjectConfigurationSummary.module.scss";

type AddToProjectConfigurationSummaryProps = {
  configuration: AddToProjectConfigurationView;
};

export default function AddToProjectConfigurationSummary({
  configuration,
}: AddToProjectConfigurationSummaryProps) {
  return (
    <section className={styles.section} aria-label="תצורת המוצר">
      <h3 className={styles.title}>תצורת המוצר</h3>
      <div className={styles.card}>
        <div className={styles.media}>
          {configuration.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- PDP modal uses known product URLs
            <img
              src={configuration.thumbnailUrl}
              alt={configuration.thumbnailAlt}
              className={styles.image}
            />
          ) : (
            <span className={styles.placeholder} aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="5" width="14" height="11" rx="1" stroke="currentColor" />
              </svg>
            </span>
          )}
        </div>
        <div className={styles.body}>
          <p className={styles.productName}>{configuration.productName}</p>
          {configuration.rows.map((row) => (
            <p key={row.label} className={styles.row}>
              {row.label}: {row.value}
            </p>
          ))}
          <p className={styles.sku} dir="ltr">
            {configuration.sku}
          </p>
        </div>
      </div>
    </section>
  );
}
