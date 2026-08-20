export type ProjectConversationType = "admin_architect" | "architect_client";

export type ProjectMessageSenderRole =
  | "professional"
  | "admin"
  | "architect"
  | "client";

export type ProjectMessageAudience =
  | "professional"
  | "admin"
  | "architect"
  | "client";

export type ProjectMessageView = {
  id: string;
  senderLabel: string;
  senderRole: ProjectMessageSenderRole;
  body: string;
  createdAt: string;
  isOwnMessage: boolean;
  isReadForCurrentUser: boolean;
};

export type ProjectConversationMessageView = {
  id: string;
  senderType: "architect" | "client";
  senderDisplayName: string;
  body: string;
  createdAt: string;
  isOwnMessage: boolean;
  isReadForCurrentUser: boolean;
  clientContextName?: string;
};

export type ProjectMessagesResult = {
  messages: ProjectMessageView[];
  totalCount: number;
  truncated: boolean;
};

export type ProjectConversationMessagesResult = {
  messages: ProjectConversationMessageView[];
  totalCount: number;
  truncated: boolean;
};

export type ProjectMessageActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export function formatUnreadMessageLabel(count: number): string | null {
  if (count <= 0) {
    return null;
  }

  if (count === 1) {
    return "הודעה חדשה";
  }

  return `${count} הודעות חדשות`;
}
