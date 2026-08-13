import styles from "./form-section.module.scss";

type ProductFormSectionProps = {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function ProductFormSection({
  id,
  title,
  description,
  children,
}: ProductFormSectionProps) {
  return (
    <section
      id={id}
      className={styles.section}
      aria-labelledby={`${id}-title`}
    >
      <div className={styles.sectionHeader}>
        <h2 id={`${id}-title`} className={styles.sectionTitle}>
          {title}
        </h2>
        {description ? (
          <p className={styles.sectionDescription}>{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
