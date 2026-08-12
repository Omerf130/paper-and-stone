import type { ProjectMessageActionState } from "@/types/project-message";
import type { ProjectMessageView } from "@/types/project-message";
import ProjectMessageForm from "@/components/project-messages/ProjectMessageForm/ProjectMessageForm";
import styles from "./ProjectMessageThread.module.scss";

type ProjectMessageThreadProps = {
  projectId: string;
  messages: ProjectMessageView[];
  messagingAvailable: boolean;
  truncated: boolean;
  sendAction: (
    projectId: string,
    body: string,
  ) => Promise<ProjectMessageActionState>;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ProjectMessageThread({
  projectId,
  messages,
  messagingAvailable,
  truncated,
  sendAction,
}: ProjectMessageThreadProps) {
  return (
    <section
      id="messages"
      className={styles.section}
      aria-labelledby="project-messages-title"
    >
      <h2 id="project-messages-title" className={styles.title}>
        שיחה על הפרויקט
      </h2>

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
                <li key={message.id} className={styles.item}>
                  <div className={styles.header}>
                    <span className={styles.sender}>{message.senderLabel}</span>
                    <time className={styles.time} dateTime={message.createdAt}>
                      {formatDate(message.createdAt)}
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
          />
        </>
      )}
    </section>
  );
}
