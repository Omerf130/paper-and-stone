export type ProjectRoomView = {
  id: string;
  projectId: string;
  name: string;
  order: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ProjectRoomCreateInput = {
  name: string;
};

export type ProjectRoomRenameInput = {
  name: string;
};

export const PROJECT_ROOM_NAME_MAX_LENGTH = 80;

export const PROJECT_ROOM_ERRORS = {
  NOT_FOUND: "החדר לא נמצא.",
  NAME_REQUIRED: "נא להזין שם חדר.",
  NAME_TOO_LONG: `שם החדר יכול להכיל עד ${PROJECT_ROOM_NAME_MAX_LENGTH} תווים.`,
  NOT_EDITABLE: "לא ניתן לערוך חדרים בפרויקט במצב הנוכחי.",
  HAS_ITEMS: "לא ניתן למחוק חדר שמכיל מוצרים. יש להעביר או להסיר את המוצרים תחילה.",
  INVALID_REORDER: "סדר החדרים אינו תקין.",
  ROOM_REQUIRED: "יש לבחור חדר לפני הוספת מוצר.",
  INVALID_ROOM: "החדר שנבחר אינו שייך לפרויקט.",
} as const;
