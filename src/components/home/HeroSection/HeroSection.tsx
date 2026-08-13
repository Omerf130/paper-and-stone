import Button from "@/components/Button/Button";
import Container from "@/components/Container/Container";
import VisualPlaceholder from "@/components/VisualPlaceholder/VisualPlaceholder";
import styles from "./HeroSection.module.scss";

export default function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="home-hero-heading">
      <Container variant="wide">
        <div className={styles.layout}>
          <div className={styles.visual}>
            <VisualPlaceholder aspectRatio="hero" className={styles.placeholder} />
          </div>

          <div className={styles.content}>
            <p className={styles.eyebrow}>Paper &amp; Stone</p>
            <h1 id="home-hero-heading" className={styles.heading}>
              ריהוט וחומרים שמתחילים ברעיון ונכנסים לפרויקט
            </h1>
            <p className={styles.supporting}>
              קטלוג ריהוט, חומרים וגמרים לאדריכלים, מעצבים ולקוחות
              שמחפשים פתרון מדויק לפרויקט.
            </p>
            <div className={styles.actions}>
              <Button href="/products" variant="primary">
                לגלות את הקולקציה
              </Button>
              <Button href="/register" variant="secondary">
                לאדריכלים ומעצבים
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
