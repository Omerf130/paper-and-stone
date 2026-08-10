"use server";

import { redirect } from "next/navigation";
import {
  clearSessionCookie,
  deleteSessionByToken,
  readSessionTokenFromCookie,
} from "./session";

export async function logoutAction(): Promise<void> {
  const rawToken = await readSessionTokenFromCookie();

  if (rawToken) {
    await deleteSessionByToken(rawToken);
  }

  await clearSessionCookie();
  redirect("/");
}
