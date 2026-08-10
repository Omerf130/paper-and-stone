import styles from "./Container.module.scss";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Container({ children, className }: ContainerProps) {
  const classes = className
    ? `${styles.container} ${className}`
    : styles.container;

  return <div className={classes}>{children}</div>;
}
