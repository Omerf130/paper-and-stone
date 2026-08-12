export type ProjectMessageSenderRole = "professional" | "admin";

export type ProjectMessageAudience = "professional" | "admin";

export type ProjectMessageView = {
  id: string;
  senderLabel: string;
  senderRole: ProjectMessageSenderRole;
  body: string;
  createdAt: string;
  isOwnMessage: boolean;
  isReadForCurrentUser: boolean;
};

export type ProjectMessagesResult = {
  messages: ProjectMessageView[];
  totalCount: number;
  truncated: boolean;
};

export type ProjectMessageActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};
