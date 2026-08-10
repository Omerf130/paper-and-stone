import styles from "./VisualPlaceholder.module.scss";

type AspectRatio = "square" | "portrait" | "landscape" | "wide" | "hero";

type VisualPlaceholderProps = {
  aspectRatio?: AspectRatio;
  className?: string;
  variant?: "default" | "subtle";
};

export default function VisualPlaceholder({
  aspectRatio = "landscape",
  className,
  variant = "default",
}: VisualPlaceholderProps) {
  const classes = [
    styles.placeholder,
    styles[aspectRatio],
    variant === "subtle" ? styles.subtle : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} aria-hidden="true" />;
}
