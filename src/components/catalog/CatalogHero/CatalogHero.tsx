import type { PublicCatalogPageContentView } from "@/types/public-catalog-content";
import styles from "./CatalogHero.module.scss";

type CatalogHeroProps = {
  content: PublicCatalogPageContentView;
  title?: string;
  description?: string;
};

export default function CatalogHero({ content, title, description }: CatalogHeroProps) {
  return (
    <header className={styles.hero}>
      <h1 className={styles.title}>{title ?? content.heading}</h1>
      {(description ?? content.supportingText) ? (
        <p className={styles.description}>{description ?? content.supportingText}</p>
      ) : null}
    </header>
  );
}
