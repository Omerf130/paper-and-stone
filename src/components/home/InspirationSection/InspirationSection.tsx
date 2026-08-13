import Container from "@/components/Container/Container";
import VisualPlaceholder from "@/components/VisualPlaceholder/VisualPlaceholder";
import PublicCmsImage from "@/components/home/PublicCmsImage/PublicCmsImage";
import type { PublicHomepageInspirationSectionView } from "@/types/public-homepage-content";
import styles from "./InspirationSection.module.scss";

type InspirationSectionProps = {
  content: PublicHomepageInspirationSectionView;
};

export default function InspirationSection({ content }: InspirationSectionProps) {
  return (
    <section className={styles.section} aria-labelledby="home-inspiration-heading">
      <Container variant="wide">
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{content.eyebrow}</p>
          <h2 id="home-inspiration-heading" className={styles.heading}>
            {content.heading}
          </h2>
          {content.showDemoNote ? (
            <p className={styles.note}>
              {content.supportingText ?? "תוכן המחצה — יש להחליף לפני השקה."}
            </p>
          ) : content.supportingText ? (
            <p className={styles.note}>{content.supportingText}</p>
          ) : null}
        </div>

        <ul className={styles.grid} aria-label="פרויקטים להשראה">
          {content.items.map((project) => (
            <li
              key={project.id}
              className={
                project.layout === "featured"
                  ? styles.itemFeatured
                  : styles.itemStandard
              }
            >
              {project.image ? (
                <PublicCmsImage
                  image={project.image}
                  className={styles.placeholder}
                  sizes="(min-width: 1024px) 33vw, 100vw"
                />
              ) : (
                <VisualPlaceholder
                  aspectRatio={project.layout === "featured" ? "wide" : "landscape"}
                  className={styles.placeholder}
                />
              )}
              <div className={styles.meta}>
                <span className={styles.title}>{project.title}</span>
                <span className={styles.subtitle}>{project.subtitle}</span>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
