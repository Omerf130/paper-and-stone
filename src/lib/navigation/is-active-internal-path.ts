export function isActiveInternalPath(pathname: string, href: string): boolean {
  if (href === "/admin" || href === "/professional") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}
