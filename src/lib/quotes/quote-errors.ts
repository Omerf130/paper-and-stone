export class QuoteMutationError extends Error {
  fieldErrors?: Record<string, string>;

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "QuoteMutationError";
    this.fieldErrors = fieldErrors;
  }
}

export const QUOTE_ERRORS = {
  GENERIC: "אירעה שגיאה בניהול הצעת המחיר. נסו שוב.",
  NOT_FOUND: "הצעת המחיר לא נמצאה.",
  PROJECT_NOT_FOUND: "הפרויקט לא נמצא.",
  NOT_QUOTABLE: "לא ניתן לנהל הצעת מחיר לפרויקט זה.",
  REVISION_MISMATCH: "הפרויקט עודכן — יש לרענן ולנסות שוב.",
  NOT_ACTIONABLE: "לא ניתן לבצע פעולה זו על הצעת המחיר.",
  ITEMS_MISMATCH: "רשימת המוצרים בפרויקט השתנתה — יש לרענן.",
  TOTAL_NEGATIVE: "סך ההצעה לא יכול להיות שלילי.",
  UNIT_PRICE_REQUIRED: "יש להזין מחיר לכל המוצרים.",
  CHANGE_MESSAGE_REQUIRED: "נדרשת הסבר לבקשת שינוי.",
  APPROVAL_REQUIRES_ACCEPTED_QUOTE:
    "לא ניתן לאשר את הפרויקט לפני שהצעת המחיר הנוכחית אושרה.",
} as const;
