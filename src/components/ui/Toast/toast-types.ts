export type ToastType = "success" | "error" | "warning" | "info";

export type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
};

export type ToastInput = {
  type: ToastType;
  message: string;
  durationMs?: number;
};
