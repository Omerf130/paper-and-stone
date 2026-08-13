import Container from "@/components/Container/Container";
import VisualPlaceholder from "@/components/VisualPlaceholder/VisualPlaceholder";
import PublicCmsImage from "@/components/home/PublicCmsImage/PublicCmsImage";
import type { PublicHomepageAboutSectionView } from "@/types/public-homepage-content";
import styles from "./AboutSection.module.scss";

type AboutSectionProps = {
  content: PublicHomepageAboutSectionView;
};

export default function AboutSection({ content }: AboutSectionProps) {
  return (
    <section className={styles.section} aria-labelledby="home-about-heading">
      <Container variant="wide">
        <div className={styles.layout}>
          <div className={styles.content}>
            <p className={styles.eyebrow}>{content.eyebrow}</p>
            <h2 id="home-about-heading" className={styles.heading}>
              {content.heading}
            </h2>
            {content.lead ? <p className={styles.lead}>{content.lead}</p> : null}
            {content.body ? <p className={styles.body}>{content.body}</p> : null}
          </div>

          <div className={styles.visual}>
            {content.image ? (
              <PublicCmsImage
                image={content.image}
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            ) : (
              <VisualPlaceholder aspectRatio="portrait" variant="subtle" />
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
