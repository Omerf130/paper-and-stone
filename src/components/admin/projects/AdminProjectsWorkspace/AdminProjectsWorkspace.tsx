import type { ReactNode } from "react";
import styles from "./AdminProjectsWorkspace.module.scss";

type AdminProjectsWorkspaceProps = {
  children: ReactNode;
};

export default function AdminProjectsWorkspace({
  children,
}: AdminProjectsWorkspaceProps) {
  return <section className={styles.workspace}>{children}</section>;
}
