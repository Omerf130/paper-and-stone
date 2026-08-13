export function buildMailtoHref(email: string): string {
  return `mailto:${email.trim()}`;
}

export function normalizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function buildTelHref(phone: string): string {
  const digits = normalizePhoneDigits(phone);
  if (!digits) {
    return `tel:${phone.trim()}`;
  }

  const normalized = digits.startsWith("972")
    ? digits
    : `972${digits.replace(/^0/, "")}`;

  return `tel:+${normalized}`;
}

export function buildWhatsAppHref(phone: string): string {
  const digits = normalizePhoneDigits(phone);
  if (!digits) {
    return "";
  }

  const normalized = digits.startsWith("972")
    ? digits
    : `972${digits.replace(/^0/, "")}`;

  return `https://wa.me/${normalized}`;
}
