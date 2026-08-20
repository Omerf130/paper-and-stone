import ProjectMessageReadMarker from "@/components/project-messages/ProjectMessageReadMarker/ProjectMessageReadMarker";
import ProjectConversationThread from "@/components/project-messages/ProjectConversationThread/ProjectConversationThread";
import {
  markClientArchitectProjectMessagesReadAction,
  sendClientArchitectProjectMessageAction,
} from "@/app/client/projects/message-actions";
import { getClientArchitectProjectMessages } from "@/lib/project-messages/architect-client-messages";
import styles from "./ClientProjectConversationSection.module.scss";

type ClientProjectConversationSectionProps = {
  clientUserId: string;
  projectId: string;
};

export default async function ClientProjectConversationSection({
  clientUserId,
  projectId,
}: ClientProjectConversationSectionProps) {
  const messageThread = await getClientArchitectProjectMessages(
    clientUserId,
    projectId,
  );

  return (
    <div className={styles.wrapper}>
      <ProjectMessageReadMarker
        projectId={projectId}
        messagingAvailable
        markReadAction={markClientArchitectProjectMessagesReadAction}
      />

      <ProjectConversationThread
        projectId={projectId}
        sectionId="architect-messages"
        title="שיחה עם האדריכל"
        messages={messageThread.messages}
        messagingAvailable
        truncated={messageThread.truncated}
        sendAction={sendClientArchitectProjectMessageAction}
        showReadState={false}
      />
    </div>
  );
}
