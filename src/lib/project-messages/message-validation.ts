import { z } from "zod";

export const MESSAGE_BODY_MAX = 4000;

export const projectMessageBodySchema = z
  .string()
  .trim()
  .min(1, "נדרשת הודעה")
  .max(MESSAGE_BODY_MAX, `ההודעה ארוכה מדי (מקסימום ${MESSAGE_BODY_MAX} תווים)`);

export function parseProjectMessageBody(
  body: string,
):
  | { success: true; data: string }
  | { success: false; fieldErrors: Record<string, string> } {
  const parsed = projectMessageBodySchema.safeParse(body);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "הודעה לא תקינה";
    return { success: false, fieldErrors: { body: message } };
  }

  return { success: true, data: parsed.data };
}
