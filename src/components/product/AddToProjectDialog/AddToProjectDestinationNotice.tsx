import styles from "./AddToProjectDestinationNotice.module.scss";

type AddToProjectDestinationNoticeProps = {
  projectName?: string;
  roomName?: string;
};

export default function AddToProjectDestinationNotice({
  projectName,
  roomName,
}: AddToProjectDestinationNoticeProps) {
  const destination =
    projectName && roomName
      ? `${projectName} / ${roomName}`
      : projectName
        ? projectName
        : "—";

  return (
    <div className={styles.notice} role="status">
      <span className={styles.icon} aria-hidden="true">
        ⓘ
      </span>
      <div className={styles.body}>
        <p className={styles.title}>המוצר יתווסף לפרויקט</p>
        <p className={styles.destination}>המוצר יתווסף אל: {destination}</p>
      </div>
    </div>
  );
}
