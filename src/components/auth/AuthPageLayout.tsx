import Container from "@/components/Container/Container";
import Section from "@/components/Section/Section";
import styles from "./AuthPageLayout.module.scss";

type AuthPageLayoutProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export default function AuthPageLayout({
  title,
  description,
  children,
}: AuthPageLayoutProps) {
  return (
    <Section className={styles.section} contained={false}>
      <Container>
        <div className={styles.inner}>
          <header className={styles.header}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.description}>{description}</p>
          </header>
          <div className={styles.content}>{children}</div>
        </div>
      </Container>
    </Section>
  );
}
