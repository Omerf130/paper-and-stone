import type { AccountStatus } from "@/lib/users/account-status";
import type { UserStatusFilter } from "@/lib/users/user-params";

export const CRM_PAGE_SIZE = 20;

export type AdminClientsParams = {
  query: string | null;
  accountStatus: AccountStatus | null;
  status: UserStatusFilter | null;
  page: number;
};

export type AdminArchitectsParams = {
  query: string | null;
  status: UserStatusFilter | null;
  page: number;
};

function parsePageValue(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return 1;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

function parseStringParam(raw: string | string[] | undefined): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

const ACCOUNT_STATUSES: AccountStatus[] = ["pending", "approved", "rejected"];
const USER_STATUSES: UserStatusFilter[] = ["active", "inactive"];

export function parseAdminClientsParams(
  searchParams: Record<string, string | string[] | undefined>,
): AdminClientsParams {
  const accountStatusRaw = parseStringParam(searchParams.accountStatus);
  const statusRaw = parseStringParam(searchParams.status);

  return {
    query: parseStringParam(searchParams.q),
    accountStatus: ACCOUNT_STATUSES.includes(accountStatusRaw as AccountStatus)
      ? (accountStatusRaw as AccountStatus)
      : null,
    status: USER_STATUSES.includes(statusRaw as UserStatusFilter)
      ? (statusRaw as UserStatusFilter)
      : null,
    page: parsePageValue(searchParams.page),
  };
}

export function parseAdminArchitectsParams(
  searchParams: Record<string, string | string[] | undefined>,
): AdminArchitectsParams {
  const statusRaw = parseStringParam(searchParams.status);

  return {
    query: parseStringParam(searchParams.q),
    status: USER_STATUSES.includes(statusRaw as UserStatusFilter)
      ? (statusRaw as UserStatusFilter)
      : null,
    page: parsePageValue(searchParams.page),
  };
}

export function buildAdminClientsHref(
  params: Partial<AdminClientsParams>,
): string {
  const search = new URLSearchParams();
  if (params.query) search.set("q", params.query);
  if (params.accountStatus) search.set("accountStatus", params.accountStatus);
  if (params.status) search.set("status", params.status);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return qs ? `/admin/clients?${qs}` : "/admin/clients";
}

export function buildAdminArchitectsHref(
  params: Partial<AdminArchitectsParams>,
): string {
  const search = new URLSearchParams();
  if (params.query) search.set("q", params.query);
  if (params.status) search.set("status", params.status);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return qs ? `/admin/architects?${qs}` : "/admin/architects";
}
