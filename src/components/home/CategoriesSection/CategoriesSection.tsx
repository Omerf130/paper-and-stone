import Link from "next/link";
import Container from "@/components/Container/Container";
import VisualPlaceholder from "@/components/VisualPlaceholder/VisualPlaceholder";
import PublicCmsImage from "@/components/home/PublicCmsImage/PublicCmsImage";
import type { PublicHomepageCategoriesSectionView } from "@/types/public-homepage-content";
import styles from "./CategoriesSection.module.scss";

type CategoriesSectionProps = {
  content: PublicHomepageCategoriesSectionView;
};

function CategoryTile({
  tile,
}: {
  tile: PublicHomepageCategoriesSectionView["tiles"][number];
}) {
  const tileClassName =
    tile.layout === "large" ? styles.tileLarge : styles.tileMedium;

  const visual = tile.image ? (
    <PublicCmsImage
      image={tile.image}
      className={styles.placeholder}
      sizes="(min-width: 1024px) 33vw, 100vw"
    />
  ) : (
    <VisualPlaceholder
      aspectRatio={tile.layout === "large" ? "wide" : "landscape"}
      className={styles.placeholder}
    />
  );

  if (tile.href) {
    return (
      <li className={tileClassName}>
        <Link href={tile.href} className={styles.tileLink}>
          {visual}
          <span className={styles.label}>{tile.title}</span>
        </Link>
      </li>
    );
  }

  return (
    <li className={tileClassName}>
      {visual}
      <span className={styles.label}>{tile.title}</span>
    </li>
  );
}

export default function CategoriesSection({ content }: CategoriesSectionProps) {
  return (
    <section className={styles.section} aria-labelledby="home-categories-heading">
      <Container variant="wide">
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{content.eyebrow}</p>
          <h2 id="home-categories-heading" className={styles.heading}>
            {content.heading}
          </h2>
          <p className={styles.supporting}>{content.supportingText}</p>
        </div>

        <ul className={styles.grid} aria-label="קטגוריות מוצרים">
          {content.tiles.map((tile) => (
            <CategoryTile key={tile.id} tile={tile} />
          ))}
        </ul>
      </Container>
    </section>
  );
}
