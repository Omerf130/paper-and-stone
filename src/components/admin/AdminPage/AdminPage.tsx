import styles from "./AdminPage.module.scss";

type AdminPageWidth = "default" | "wide" | "form";

type AdminPageProps = {
  children: React.ReactNode;
  width?: AdminPageWidth;
};

export default function AdminPage({
  children,
  width = "wide",
}: AdminPageProps) {
  const className =
    width === "default"
      ? `${styles.page} ${styles.default}`
      : width === "form"
        ? `${styles.page} ${styles.form}`
        : styles.page;

  return <div className={className}>{children}</div>;
}
