import type { ProjectMessageActionState } from "@/types/project-message";
import type { ProjectMessageView } from "@/types/project-message";
import ProjectMessageForm from "@/components/project-messages/ProjectMessageForm/ProjectMessageForm";
import { formatDateTime } from "@/lib/ui/format-date-time";
import styles from "./ProjectMessageThread.module.scss";

type ProjectMessageThreadVariant = "default" | "admin";

type ProjectMessageThreadProps = {
  projectId: string;
  messages: ProjectMessageView[];
  messagingAvailable: boolean;
  truncated: boolean;
  sendAction: (
    projectId: string,
    body: string,
  ) => Promise<ProjectMessageActionState>;
  variant?: ProjectMessageThreadVariant;
  hideTitle?: boolean;
};

export default function ProjectMessageThread({
  projectId,
  messages,
  messagingAvailable,
  truncated,
  sendAction,
  variant = "default",
  hideTitle = false,
}: ProjectMessageThreadProps) {
  const sectionClassName =
    variant === "admin" ? `${styles.section} ${styles.admin}` : styles.section;

  return (
    <section
      id="messages"
      className={sectionClassName}
      aria-labelledby={hideTitle ? undefined : "project-messages-title"}
    >
      {hideTitle ? null : (
        <h2 id="project-messages-title" className={styles.title}>
          שיחה על הפרויקט
        </h2>
      )}

      {!messagingAvailable ? (
        <p className={styles.unavailable}>
          שיחה תיפתח לאחר שליחת הפרויקט לבדיקה.
        </p>
      ) : (
        <>
          {truncated ? (
            <p className={styles.notice} role="status">
              מוצגות 50 ההודעות האחרונות
            </p>
          ) : null}

          {messages.length === 0 ? (
            <p className={styles.empty}>עדיין אין הודעות בשיחה זו.</p>
          ) : (
            <ol className={styles.list}>
              {messages.map((message) => (
                <li
                  key={message.id}
                  className={
                    message.senderRole === "admin"
                      ? `${styles.item} ${styles.adminMessage}`
                      : `${styles.item} ${styles.professionalMessage}`
                  }
                >
                  <div className={styles.header}>
                    <span className={styles.sender}>{message.senderLabel}</span>
                    <time className={styles.time} dateTime={message.createdAt}>
                      {formatDateTime(message.createdAt)}
                    </time>
                  </div>
                  {!message.isOwnMessage ? (
                    <p className={styles.readState}>
                      {message.isReadForCurrentUser ? "נקרא" : "לא נקרא"}
                    </p>
                  ) : null}
                  <p className={styles.body}>{message.body}</p>
                </li>
              ))}
            </ol>
          )}

          <ProjectMessageForm
            projectId={projectId}
            sendAction={sendAction}
            disabled={!messagingAvailable}
            variant={variant}
          />
        </>
      )}
    </section>
  );
}
