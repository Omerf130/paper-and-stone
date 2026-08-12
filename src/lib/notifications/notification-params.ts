export const NOTIFICATIONS_PAGE_SIZE = 20;

export type NotificationsParams = {
  page: number;
};

export type NotificationsHrefInput = {
  page?: number;
};

function parsePageValue(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;

  if (!value) {
    return 1;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

export function parseNotificationsParams(
  raw: Record<string, string | string[] | undefined>,
): NotificationsParams {
  return {
    page: parsePageValue(raw.page),
  };
}

export function buildNotificationsHref(
  input: NotificationsHrefInput = {},
): string {
  if (input.page && input.page > 1) {
    return `/professional/notifications?page=${input.page}`;
  }

  return "/professional/notifications";
}
