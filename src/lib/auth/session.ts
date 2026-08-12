import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db/mongoose";
import Session from "@/models/Session";
import {
  isProduction,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "./config";

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function isSessionExpired(expiresAt: Date, now = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}

function getSessionExpiryDate(): Date {
  return new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
}

export async function createSession(userId: string): Promise<void> {
  await connectDB();

  const rawToken = generateSessionToken();
  const tokenHash = hashSessionToken(rawToken);

  await Session.create({
    userId,
    tokenHash,
    expiresAt: getSessionExpiryDate(),
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function findValidSessionByToken(rawToken: string) {
  await connectDB();

  const tokenHash = hashSessionToken(rawToken);
  const session = await Session.findOne({ tokenHash });

  if (!session || isSessionExpired(session.expiresAt)) {
    return null;
  }

  return session;
}

export async function deleteSessionByToken(rawToken: string): Promise<void> {
  await connectDB();

  const tokenHash = hashSessionToken(rawToken);
  await Session.deleteOne({ tokenHash });
}

export async function deleteSessionsForUser(userId: string): Promise<void> {
  await connectDB();
  await Session.deleteMany({ userId });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path: "/",
    maxAge: 0,
  });
}

export async function readSessionTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return token ?? null;
}
