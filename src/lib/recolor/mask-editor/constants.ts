export const ABSOLUTE_MAX_UNDO_STATES = 12;
export const HISTORY_MEMORY_BUDGET_BYTES = 64 * 1024 * 1024;

export const BRUSH_SIZE_MIN = 8;
export const BRUSH_SIZE_MAX = 120;
export const BRUSH_SIZE_DEFAULT = 32;

export const ZOOM_MODES = ["fit", "100", "150", "200"] as const;
export type ZoomModeIndex = 0 | 1 | 2 | 3;

export const OVERLAY_COLOR = { r: 255, g: 70, b: 70, a: 0.45 };
