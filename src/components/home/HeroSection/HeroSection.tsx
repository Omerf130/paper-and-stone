import Button from "@/components/Button/Button";
import Container from "@/components/Container/Container";
import VisualPlaceholder from "@/components/VisualPlaceholder/VisualPlaceholder";
import PublicCmsImage from "@/components/home/PublicCmsImage/PublicCmsImage";
import type { PublicHomepageHeroView } from "@/types/public-homepage-content";
import styles from "./HeroSection.module.scss";

type HeroSectionProps = {
  content: PublicHomepageHeroView;
};

function renderCta(
  cta: PublicHomepageHeroView["primaryCta"],
  variant: "primary" | "secondary",
) {
  if (cta.isVisible === false) {
    return null;
  }

  return (
    <Button href={cta.href} variant={variant}>
      {cta.label}
    </Button>
  );
}

export default function HeroSection({ content }: HeroSectionProps) {
  const primaryCta = renderCta(content.primaryCta, "primary");
  const secondaryCta = renderCta(content.secondaryCta, "secondary");

  return (
    <section className={styles.hero} aria-labelledby="home-hero-heading">
      <Container variant="wide">
        <div className={styles.layout}>
          <div className={styles.visual}>
            {content.image ? (
              <PublicCmsImage
                image={content.image}
                className={styles.placeholder}
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
              />
            ) : (
              <VisualPlaceholder aspectRatio="hero" className={styles.placeholder} />
            )}
          </div>

          <div className={styles.content}>
            <p className={styles.eyebrow}>{content.eyebrow}</p>
            <h1 id="home-hero-heading" className={styles.heading}>
              {content.heading}
            </h1>
            <p className={styles.supporting}>{content.supportingText}</p>
            {primaryCta || secondaryCta ? (
              <div className={styles.actions}>
                {primaryCta}
                {secondaryCta}
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
