import Button from "@/components/Button/Button";
import Container from "@/components/Container/Container";
import type { PublicHomepageClosingSectionView } from "@/types/public-homepage-content";
import styles from "./ContactCtaSection.module.scss";

type ContactCtaSectionProps = {
  content: PublicHomepageClosingSectionView;
};

function renderCta(
  cta: PublicHomepageClosingSectionView["primaryCta"],
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

export default function ContactCtaSection({ content }: ContactCtaSectionProps) {
  const primaryCta = renderCta(content.primaryCta, "primary");
  const secondaryCta = renderCta(content.secondaryCta, "secondary");

  return (
    <section className={styles.section} aria-labelledby="home-closing-heading">
      <Container variant="wide">
        <div className={styles.content}>
          <h2 id="home-closing-heading" className={styles.heading}>
            {content.heading}
          </h2>
          <p className={styles.supporting}>{content.supportingText}</p>
          {content.contactNote ? (
            <p className={styles.note}>{content.contactNote}</p>
          ) : null}
          {primaryCta || secondaryCta ? (
            <div className={styles.actions}>
              {primaryCta}
              {secondaryCta}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
