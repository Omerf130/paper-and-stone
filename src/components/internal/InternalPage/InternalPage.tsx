import styles from "./InternalPage.module.scss";

export type InternalPageWidth = "default" | "wide" | "form";

type InternalPageProps = {
  children: React.ReactNode;
  width?: InternalPageWidth;
};

export default function InternalPage({
  children,
  width = "wide",
}: InternalPageProps) {
  const className =
    width === "default"
      ? `${styles.page} ${styles.default}`
      : width === "form"
        ? `${styles.page} ${styles.form}`
        : styles.page;

  return <div className={className}>{children}</div>;
}
