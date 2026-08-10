export const SESSION_COOKIE_NAME = "ps_session";

export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
