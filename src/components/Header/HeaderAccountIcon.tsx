import Link from "next/link";
import {
  canAccessArchitectWorkspace,
  canAccessClientWorkspace,
} from "@/lib/auth/account-access";
import type { SafeUser } from "@/types/user";
import { UserIcon } from "./icons";
import styles from "./HeaderAccountIcon.module.scss";

type HeaderAccountIconProps = {
  user: SafeUser | null;
};

function resolveAccountHref(user: SafeUser): string {
  if (user.role === "admin") {
    return "/admin";
  }

  if (canAccessArchitectWorkspace(user)) {
    return "/professional";
  }

  if (canAccessClientWorkspace(user)) {
    return "/client";
  }

  return "/account/status";
}

export default function HeaderAccountIcon({ user }: HeaderAccountIconProps) {
  const href = user ? resolveAccountHref(user) : "/login";
  const label = user ? "החשבון שלי" : "התחברות";

  return (
    <Link href={href} className={styles.link} aria-label={label}>
      <UserIcon />
    </Link>
  );
}
