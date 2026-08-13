import Container from "@/components/Container/Container";
import VisualPlaceholder from "@/components/VisualPlaceholder/VisualPlaceholder";
import styles from "./AboutSection.module.scss";

export default function AboutSection() {
  return (
    <section className={styles.section} aria-labelledby="home-about-heading">
      <Container variant="wide">
        <div className={styles.layout}>
          <div className={styles.content}>
            <p className={styles.eyebrow}>Paper &amp; Stone</p>
            <h2 id="home-about-heading" className={styles.heading}>
              ריהוט, חומרים ופתרונות לפרויקטים מדויקים
            </h2>
            <p className={styles.lead}>
              Paper &amp; Stone מייבאת ומשווקת ריהוט, חומרים ופתרונות עיצוב
              לפרויקטים פרטיים ומקצועיים.
            </p>
            <p className={styles.body}>
              אנחנו עובדים עם אדריכלים, מעצבי פנים ולקוחות פרטיים שמחפשים
              איכות, דיוק וגישה מקצועית — מהבחירה הראשונה ועד הכניסה
              לפרויקט.
            </p>
          </div>

          <div className={styles.visual}>
            <VisualPlaceholder aspectRatio="portrait" variant="subtle" />
          </div>
        </div>
      </Container>
    </section>
  );
}
