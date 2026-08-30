"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  readAdminSidebarCollapsed,
  writeAdminSidebarCollapsed,
} from "@/lib/admin/admin-sidebar-preference";

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getCollapsedSnapshot(): boolean {
  return readAdminSidebarCollapsed();
}

function getCollapsedServerSnapshot(): boolean {
  return false;
}

function emitCollapsedChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function useAdminSidebarCollapsed(): {
  collapsed: boolean;
  toggleCollapsed: () => void;
} {
  const collapsed = useSyncExternalStore(
    subscribe,
    getCollapsedSnapshot,
    getCollapsedServerSnapshot,
  );

  const toggleCollapsed = useCallback(() => {
    writeAdminSidebarCollapsed(!readAdminSidebarCollapsed());
    emitCollapsedChange();
  }, []);

  return { collapsed, toggleCollapsed };
}

export function useAdminSidebarTransitionsEnabled(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
