import type { ProjectStatus } from "@/types/project";
import type { ClientProjectPresentationState } from "@/types/client-project";

export type ClientProjectPresentationInput = {
  hasApprovedSnapshot: boolean;
  projectStatus?: ProjectStatus | string;
  commercialDirty?: boolean;
  liveSubmissionRevision?: number;
  snapshotSubmissionRevision?: number;
};

export function isClientProjectUpdating(
  input: ClientProjectPresentationInput,
): boolean {
  if (!input.hasApprovedSnapshot) {
    return false;
  }

  if (input.commercialDirty) {
    return true;
  }

  if (
    input.projectStatus === "submitted" ||
    input.projectStatus === "changes_requested"
  ) {
    return true;
  }

  const liveRevision = input.liveSubmissionRevision ?? 0;
  const snapshotRevision = input.snapshotSubmissionRevision ?? 0;

  if (liveRevision > snapshotRevision) {
    return true;
  }

  if (input.projectStatus !== "approved") {
    return true;
  }

  return false;
}

export function getClientProjectPresentationState(
  input: ClientProjectPresentationInput,
): ClientProjectPresentationState {
  if (!input.hasApprovedSnapshot) {
    return {
      label: "בתהליך עבודה",
      tone: "neutral",
      supportingText:
        "הפרויקט בתהליך עבודה. פרטי המוצרים והמחירים יוצגו לאחר אישור.",
      isUpdating: false,
    };
  }

  if (isClientProjectUpdating(input)) {
    return {
      label: "הפרויקט מתעדכן",
      tone: "info",
      supportingText: "המידע שמוצג כאן הוא הגרסה האחרונה שאושרה.",
      isUpdating: true,
    };
  }

  return {
    label: "גרסה מאושרת",
    tone: "positive",
    isUpdating: false,
  };
}
