import type { ClientProjectPresentationInput } from "@/lib/client-projects/getClientProjectPresentationState";
import {
  getClientProjectPresentationState,
  isClientProjectUpdating,
} from "@/lib/client-projects/getClientProjectPresentationState";

export function getClientProjectPresentationStateWithKind(
  input: ClientProjectPresentationInput & {
    isApprovedContentUnavailable?: boolean;
  },
) {
  if (input.isApprovedContentUnavailable) {
    return {
      label: "הגרסה המאושרת אינה זמינה כרגע",
      tone: "warning" as const,
      supportingText:
        "לא ניתן להציג כרגע את פרטי הפרויקט המאושרים. ניתן לנסות שוב מאוחר יותר.",
      isUpdating: false,
    };
  }

  return getClientProjectPresentationState(input);
}

export { isClientProjectUpdating };
