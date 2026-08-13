import Button from "@/components/Button/Button";
import Container from "@/components/Container/Container";
import styles from "./ContactCtaSection.module.scss";

export default function ContactCtaSection() {
  return (
    <section className={styles.section} aria-labelledby="home-closing-heading">
      <Container variant="wide">
        <div className={styles.content}>
          <h2 id="home-closing-heading" className={styles.heading}>
            מתחילים פרויקט?
          </h2>
          <p className={styles.supporting}>
            גלו את הקולקציה, או פתחו חשבון מקצועי כדי לנהל פרויקט
            מול Paper &amp; Stone.
          </p>
          <p className={styles.note}>
            פרטי יצירת קשר יפורסמו בהמשך.
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
      </Container>
    </section>
  );
}
