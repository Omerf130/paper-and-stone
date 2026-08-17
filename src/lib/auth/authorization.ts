import { redirect } from "next/navigation";
import type { SafeUser } from "@/types/user";
import { getCurrentUser } from "./current-user";

export function isAdminUser(
  user: SafeUser | null,
): user is SafeUser & { role: "admin" } {
  return user !== null && user.role === "admin";
}

export function isClientUser(
  user: SafeUser | null,
): user is SafeUser & { role: "client" } {
  return user !== null && user.role === "client";
}

export function isArchitectUser(
  user: SafeUser | null,
): user is SafeUser & { role: "architect" } {
  return user !== null && user.role === "architect";
}

/** @deprecated Use isArchitectUser */
export function isProfessionalUser(
  user: SafeUser | null,
): user is SafeUser & { role: "architect" } {
  return isArchitectUser(user);
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

export async function requireClient(): Promise<SafeUser & { role: "client" }> {
  const user = await requireUser();

  if (!isClientUser(user)) {
    redirect("/");
  }

  return user;
}

export async function requireArchitect(): Promise<
  SafeUser & { role: "architect" }
> {
  const user = await requireUser();

  if (!isArchitectUser(user)) {
    redirect("/");
  }

  return user;
}

/** @deprecated Use requireArchitect */
export async function requireProfessional(): Promise<
  SafeUser & { role: "architect" }
> {
  return requireArchitect();
}
