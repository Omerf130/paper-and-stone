import Container from "@/components/Container/Container";
import styles from "./Section.module.scss";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  contained?: boolean;
};

export default function Section({
  children,
  className,
  contained = true,
}: SectionProps) {
  const sectionClass = contained ? styles.section : styles.fullWidth;
  const classes = className ? `${sectionClass} ${className}` : sectionClass;

  if (contained) {
    return (
      <section className={classes}>
        <Container>{children}</Container>
      </section>
    );
  }

  return <section className={classes}>{children}</section>;
}
