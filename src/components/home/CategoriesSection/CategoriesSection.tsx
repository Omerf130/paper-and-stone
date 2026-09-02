import Link from "next/link";
import Container from "@/components/Container/Container";
import { ArrowRightIcon } from "@/components/Header/icons";
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
  const visual = tile.image ? (
    <PublicCmsImage
      image={tile.image}
      className={styles.image}
      sizes="(min-width: 1280px) 12vw, (min-width: 768px) 20vw, 70vw"
    />
  ) : (
    <VisualPlaceholder aspectRatio="portrait" className={styles.image} />
  );

  const label = (
    <>
      <span className={styles.label}>{tile.title}</span>
      <ArrowRightIcon className={styles.arrow} />
    </>
  );

  if (tile.href) {
    return (
      <li className={styles.tile}>
        <Link href={tile.href} className={styles.tileLink}>
          {visual}
          <span className={styles.meta}>{label}</span>
        </Link>
      </li>
    );
  }

  return (
    <li className={styles.tile}>
      {visual}
      <span className={styles.meta}>{label}</span>
    </li>
  );
}

export default function CategoriesSection({ content }: CategoriesSectionProps) {
  return (
    <section className={styles.section} aria-labelledby="home-categories-heading">
      <Container variant="wide">
        <div className={styles.intro}>
          {content.eyebrow ? <p className={styles.eyebrow}>{content.eyebrow}</p> : null}
          <h2 id="home-categories-heading" className={styles.heading}>
            {content.heading}
          </h2>
          <p className={styles.supporting}>{content.supportingText}</p>
        </div>

        <ul className={styles.row} aria-label="קטגוריות מוצרים">
          {content.tiles.map((tile) => (
            <CategoryTile key={tile.id} tile={tile} />
          ))}
        </ul>
      </Container>
    </section>
  );
}
