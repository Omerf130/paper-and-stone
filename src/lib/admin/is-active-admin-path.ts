export function isActiveAdminPath(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname.startsWith(href);
}
