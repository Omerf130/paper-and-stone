import type { PublicCatalogPageContentView } from "@/types/public-catalog-content";
import styles from "./CatalogHero.module.scss";

type CatalogHeroProps = {
  content: PublicCatalogPageContentView;
};

export default function CatalogHero({ content }: CatalogHeroProps) {
  return (
    <header className={styles.hero}>
      <p className={styles.eyebrow}>{content.eyebrow}</p>
      <h1 className={styles.title}>{content.heading}</h1>
      <p className={styles.description}>{content.supportingText}</p>
    </header>
  );
}
