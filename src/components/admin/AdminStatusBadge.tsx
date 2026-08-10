import styles from "./AdminStatusBadge.module.scss";

type AdminStatusBadgeProps = {
  active: boolean;
  labelOn: string;
  labelOff: string;
};

export default function AdminStatusBadge({
  active,
  labelOn,
  labelOff,
}: AdminStatusBadgeProps) {
  return (
    <span className={active ? styles.on : styles.off}>
      {active ? labelOn : labelOff}
    </span>
  );
}
