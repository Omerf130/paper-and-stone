import styles from "./Container.module.scss";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "wide";
};

export default function Container({
  children,
  className,
  variant = "default",
}: ContainerProps) {
  const variantClass = variant === "wide" ? styles.wide : styles.container;
  const classes = className ? `${variantClass} ${className}` : variantClass;

  return <div className={classes}>{children}</div>;
}
