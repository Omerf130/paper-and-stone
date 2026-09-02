import type { ReactNode } from "react";
import styles from "./AdminProductsWorkspace.module.scss";

type AdminProductsWorkspaceProps = {
  children: ReactNode;
};

export default function AdminProductsWorkspace({
  children,
}: AdminProductsWorkspaceProps) {
  return <section className={styles.workspace}>{children}</section>;
}
