export const ADMIN_SIDEBAR_COLLAPSED_STORAGE_KEY =
  "paper-stone:admin-sidebar-collapsed";

function getStorage(): Storage | null {
  if (typeof globalThis.localStorage === "undefined") {
    return null;
  }

  return globalThis.localStorage;
}

export function readAdminSidebarCollapsed(): boolean {
  const storage = getStorage();
  if (!storage) {
    return false;
  }

  try {
    return storage.getItem(ADMIN_SIDEBAR_COLLAPSED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeAdminSidebarCollapsed(collapsed: boolean): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    if (collapsed) {
      storage.setItem(ADMIN_SIDEBAR_COLLAPSED_STORAGE_KEY, "1");
    } else {
      storage.removeItem(ADMIN_SIDEBAR_COLLAPSED_STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures; preference is UI-only.
  }
}
