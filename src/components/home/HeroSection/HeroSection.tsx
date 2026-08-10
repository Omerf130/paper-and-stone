import Button from "@/components/Button/Button";
import Container from "@/components/Container/Container";
import VisualPlaceholder from "@/components/VisualPlaceholder/VisualPlaceholder";
import styles from "./HeroSection.module.scss";

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <Container>
        <div className={styles.layout}>
          <div className={styles.visual}>
            <VisualPlaceholder aspectRatio="hero" />
          </div>

          <div className={styles.content}>
            <p className={styles.eyebrow}>Paper &amp; Stone</p>
            <h1 className={styles.heading}>
              ריהוט וחומרים שמתחילים ברעיון ונכנסים לפרויקט
            </h1>
            <p className={styles.supporting}>
              קטלוג ריהוט, חומרים וגמרים לאדריכלים, מעצבים ולקוחות
              שמחפשים פתרון מדויק לפרויקט.
            </p>
            <div
              className={styles.actions}
              aria-label="תצוגה מקדימה — כפתורים לא פעילים"
            >
              <Button preview variant="primary">
                לגלות את הקולקציה
              </Button>
              <Button preview variant="secondary">
                לאדריכלים ומעצבים
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
