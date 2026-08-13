import Button from "@/components/Button/Button";
import Container from "@/components/Container/Container";
import VisualPlaceholder from "@/components/VisualPlaceholder/VisualPlaceholder";
import PublicCmsImage from "@/components/home/PublicCmsImage/PublicCmsImage";
import type { PublicHomepageProfessionalsSectionView } from "@/types/public-homepage-content";
import styles from "./ProfessionalsSection.module.scss";

type ProfessionalsSectionProps = {
  content: PublicHomepageProfessionalsSectionView;
};

function renderCta(
  cta: PublicHomepageProfessionalsSectionView["primaryCta"],
  variant: "primary" | "text",
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

export default function ProfessionalsSection({ content }: ProfessionalsSectionProps) {
  const primaryCta = renderCta(content.primaryCta, "primary");
  const secondaryCta = renderCta(content.secondaryCta, "text");

  return (
    <section className={styles.section} aria-labelledby="home-professionals-heading">
      <Container variant="wide">
        <div className={styles.layout}>
          <div className={styles.visual}>
            {content.image ? (
              <PublicCmsImage
                image={content.image}
                className={styles.placeholder}
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            ) : (
              <VisualPlaceholder aspectRatio="portrait" className={styles.placeholder} />
            )}
          </div>

          <div className={styles.content}>
            <p className={styles.eyebrow}>{content.eyebrow}</p>
            <h2 id="home-professionals-heading" className={styles.heading}>
              {content.heading}
            </h2>
            <p className={styles.supporting}>{content.body}</p>

            <ol className={styles.steps}>
              {content.steps.map((step) => (
                <li key={step.id} className={styles.step}>
                  <span className={styles.stepNumber}>{step.step}</span>
                  <span className={styles.stepTitle}>{step.title}</span>
                </li>
              ))}
            </ol>

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
