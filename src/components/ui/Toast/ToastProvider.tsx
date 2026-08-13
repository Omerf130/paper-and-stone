"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import ToastViewport from "./ToastViewport";
import type { ToastInput, ToastItem } from "./toast-types";

const MAX_TOASTS = 3;
const DEFAULT_DURATIONS: Record<ToastInput["type"], number> = {
  success: 4000,
  info: 4000,
  warning: 5000,
  error: 6000,
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function createToastId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = createToastId();
      const item: ToastItem = {
        id,
        type: input.type,
        message: input.message,
      };

      setToasts((current) => {
        const next = [...current, item];
        return next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next;
      });

      const duration = input.durationMs ?? DEFAULT_DURATIONS[input.type];
      const timer = setTimeout(() => dismiss(id), duration);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
