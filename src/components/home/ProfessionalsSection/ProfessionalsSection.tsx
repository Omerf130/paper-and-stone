import Button from "@/components/Button/Button";
import Container from "@/components/Container/Container";
import VisualPlaceholder from "@/components/VisualPlaceholder/VisualPlaceholder";
import { workflowSteps } from "../homepage-data";
import styles from "./ProfessionalsSection.module.scss";

export default function ProfessionalsSection() {
  return (
    <section className={styles.section} aria-labelledby="home-professionals-heading">
      <Container variant="wide">
        <div className={styles.layout}>
          <div className={styles.visual}>
            <VisualPlaceholder aspectRatio="portrait" className={styles.placeholder} />
          </div>

          <div className={styles.content}>
            <p className={styles.eyebrow}>לאדריכלים ומעצבים</p>
            <h2 id="home-professionals-heading" className={styles.heading}>
              כל הפרויקט. במקום אחד.
            </h2>
            <p className={styles.supporting}>
              פלטפורמה מקצועית לניהול פרויקטים — מארגון חדרים ומוצרים
              ועד שליחה לתמחור ומעקב.
            </p>

            <ol className={styles.steps}>
              {workflowSteps.map((step) => (
                <li key={step.step} className={styles.step}>
                  <span className={styles.stepNumber}>{step.step}</span>
                  <span className={styles.stepTitle}>{step.title}</span>
                </li>
              ))}
            </ol>

            <div className={styles.actions}>
              <Button href="/register" variant="primary">
                פתיחת חשבון מקצועי
              </Button>
              <Button href="/login" variant="text">
                התחברות
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
