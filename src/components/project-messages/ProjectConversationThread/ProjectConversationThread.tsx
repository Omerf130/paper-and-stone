"use client";

import type { ProjectConversationMessageView } from "@/types/project-message";
import type { ProjectMessageActionState } from "@/types/project-message";
import ProjectMessageForm from "@/components/project-messages/ProjectMessageForm/ProjectMessageForm";
import { formatDateTime } from "@/lib/ui/format-date-time";
import styles from "./ProjectConversationThread.module.scss";

type ProjectConversationThreadProps = {
  projectId: string;
  sectionId: string;
  title: string;
  messages: ProjectConversationMessageView[];
  messagingAvailable: boolean;
  unavailableMessage?: string;
  truncated: boolean;
  readOnly?: boolean;
  readOnlyNotice?: string;
  composerDisabled?: boolean;
  composerDisabledMessage?: string;
  hideTitle?: boolean;
  showReadState?: boolean;
  sendAction?: (
    projectId: string,
    body: string,
  ) => Promise<ProjectMessageActionState>;
};

export default function ProjectConversationThread({
  projectId,
  sectionId,
  title,
  messages,
  messagingAvailable,
  unavailableMessage = "שיחה עם הלקוח תיפתח לאחר שיישווך לקוח לפרויקט.",
  truncated,
  readOnly = false,
  readOnlyNotice,
  composerDisabled = false,
  composerDisabledMessage,
  hideTitle = false,
  showReadState = true,
  sendAction,
}: ProjectConversationThreadProps) {
  const formControlId = `${sectionId}-${projectId}`;
  return (
    <section
      id={sectionId}
      className={styles.section}
      aria-labelledby={hideTitle ? undefined : `${sectionId}-title`}
    >
      {hideTitle ? null : (
        <h2 id={`${sectionId}-title`} className={styles.title}>
          {title}
        </h2>
      )}

      {readOnly && readOnlyNotice ? (
        <p className={styles.readOnlyNotice} role="status">
          {readOnlyNotice}
        </p>
      ) : null}

      {!messagingAvailable ? (
        <p className={styles.unavailable}>{unavailableMessage}</p>
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
                    message.senderType === "architect"
                      ? `${styles.item} ${styles.architectMessage}`
                      : `${styles.item} ${styles.clientMessage}`
                  }
                >
                  {message.clientContextName ? (
                    <p className={styles.clientContext}>
                      לקוח: {message.clientContextName}
                    </p>
                  ) : null}
                  <div className={styles.header}>
                    <span className={styles.sender}>
                      {message.senderDisplayName}
                    </span>
                    <time className={styles.time} dateTime={message.createdAt}>
                      {formatDateTime(message.createdAt)}
                    </time>
                  </div>
                  {!readOnly && showReadState && !message.isOwnMessage ? (
                    <p className={styles.readState}>
                      {message.isReadForCurrentUser ? "נקרא" : "לא נקרא"}
                    </p>
                  ) : null}
                  <p className={styles.body}>{message.body}</p>
                </li>
              ))}
            </ol>
          )}

          {!readOnly && sendAction ? (
            <>
              {composerDisabled && composerDisabledMessage ? (
                <p className={styles.composerDisabled}>{composerDisabledMessage}</p>
              ) : null}
              <ProjectMessageForm
                projectId={projectId}
                formControlId={formControlId}
                sendAction={sendAction}
                disabled={composerDisabled}
              />
            </>
          ) : null}
        </>
      )}
    </section>
  );
}
