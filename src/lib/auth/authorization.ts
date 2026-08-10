import { redirect } from "next/navigation";
import type { SafeUser } from "@/types/user";
import { getCurrentUser } from "./current-user";

export function isAdminUser(
  user: SafeUser | null,
): user is SafeUser & { role: "admin" } {
  return user !== null && user.role === "admin";
}

export async function requireUser(): Promise<SafeUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin(): Promise<SafeUser & { role: "admin" }> {
  const user = await requireUser();

  if (!isAdminUser(user)) {
    redirect("/");
  }

  return user;
}
