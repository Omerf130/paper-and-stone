import PublicCmsImage from "@/components/home/PublicCmsImage/PublicCmsImage";
import VisualPlaceholder from "@/components/VisualPlaceholder/VisualPlaceholder";
import type { PublicHomepageHeroView } from "@/types/public-homepage-content";
import { ChevronDownIcon } from "@/components/Header/icons";
import styles from "./HeroSection.module.scss";

type HeroSectionProps = {
  content: PublicHomepageHeroView;
};

export default function HeroSection({ content }: HeroSectionProps) {
  return (
    <section className={styles.hero} aria-label="Hero">
      <div className={styles.visual}>
        {content.image ? (
          <PublicCmsImage
            image={content.image}
            className={styles.image}
            sizes="100vw"
            priority
          />
        ) : (
          <VisualPlaceholder aspectRatio="hero" className={styles.image} />
        )}
        <div className={styles.scrollIndicator} aria-hidden="true">
          <ChevronDownIcon />
        </div>
      </div>
    </section>
  );
}
