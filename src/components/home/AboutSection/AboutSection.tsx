import Button from "@/components/Button/Button";
import Section from "@/components/Section/Section";
import VisualPlaceholder from "@/components/VisualPlaceholder/VisualPlaceholder";
import styles from "./AboutSection.module.scss";

export default function AboutSection() {
  return (
    <Section>
      <div className={styles.layout}>
        <div className={styles.content}>
          <h2 className={styles.heading}>Paper &amp; Stone</h2>
          <p className={styles.lead}>
            Paper &amp; Stone מייבאת ומשווקת ריהוט, חומרים ופתרונות עיצוב
            לפרויקטים פרטיים ומקצועיים.
          </p>
          <p className={styles.body}>
            אנחנו עובדים עם אדריכלים, מעצבי פנים ולקוחות פרטיים שמחפשים
            איכות, דיוק וגישה מקצועית — מהבחירה הראשונה ועד הכניסה
            לפרויקט.
          </p>
          <div aria-label="תצוגה מקדימה — כפתור לא פעיל">
            <Button preview variant="text">
              על Paper &amp; Stone
            </Button>
          </div>
        </div>

        <div className={styles.visual}>
          <VisualPlaceholder aspectRatio="portrait" variant="subtle" />
        </div>
      </div>
    </Section>
  );
}
