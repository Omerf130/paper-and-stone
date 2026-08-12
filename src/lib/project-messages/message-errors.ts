export const MESSAGE_ERRORS = {
  GENERIC: "אירעה שגיאה בשליחת ההודעה. נסו שוב.",
  NOT_FOUND: "הפרויקט לא נמצא.",
  NOT_AVAILABLE: "שיחה על הפרויקט אינה זמינה בשלב זה.",
  FORBIDDEN: "אין הרשאה לשלוח הודעה בפרויקט זה.",
} as const;

export class ProjectMessageMutationError extends Error {
  fieldErrors?: Record<string, string>;

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ProjectMessageMutationError";
    this.fieldErrors = fieldErrors;
  }
}
