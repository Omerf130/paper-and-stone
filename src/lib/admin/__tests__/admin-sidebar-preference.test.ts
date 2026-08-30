import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  ADMIN_SIDEBAR_COLLAPSED_STORAGE_KEY,
  readAdminSidebarCollapsed,
  writeAdminSidebarCollapsed,
} from "@/lib/admin/admin-sidebar-preference";

function createStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
}

describe("admin-sidebar-preference", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createStorageMock());
  });

  it("defaults to expanded when no preference is stored", () => {
    expect(readAdminSidebarCollapsed()).toBe(false);
  });

  it("persists collapsed preference", () => {
    writeAdminSidebarCollapsed(true);
    expect(readAdminSidebarCollapsed()).toBe(true);
    expect(localStorage.getItem(ADMIN_SIDEBAR_COLLAPSED_STORAGE_KEY)).toBe("1");
  });

  it("clears storage when expanded", () => {
    writeAdminSidebarCollapsed(true);
    writeAdminSidebarCollapsed(false);
    expect(readAdminSidebarCollapsed()).toBe(false);
    expect(localStorage.getItem(ADMIN_SIDEBAR_COLLAPSED_STORAGE_KEY)).toBeNull();
  });
});
