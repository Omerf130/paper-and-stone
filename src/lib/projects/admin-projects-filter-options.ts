export type AdminProjectsFilterOption = {
  id: string;
  label: string;
};

export function formatAdminProjectsFilterOptionLabel(input: {
  fullName?: string | null;
  email: string;
  companyName?: string | null;
}): string {
  const name = input.fullName?.trim() || input.email;
  const company = input.companyName?.trim();

  return company ? `${name} · ${company}` : name;
}

export function mergeAdminProjectsFilterOption(
  options: AdminProjectsFilterOption[],
  selected: AdminProjectsFilterOption | null,
): AdminProjectsFilterOption[] {
  if (!selected) {
    return options;
  }

  if (options.some((option) => option.id === selected.id)) {
    return options;
  }

  return [selected, ...options];
}
