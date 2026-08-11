export const PRODUCT_MATERIAL_OPTION_ERRORS = {
  INVALID_MATERIAL_ID: "מזהה חומר לא תקין",
  INVALID_COLOR_ID: "מזהה צבע לא תקין",
  MATERIAL_NOT_FOUND: "אחד או יותר מהחומרים שנבחרו לא קיימים",
  COLOR_NOT_FOUND: "אחד או יותר מהצבעים שנבחרו לא קיימים",
  INACTIVE_MATERIAL: "לא ניתן להוסיף חומר לא פעיל",
  INACTIVE_COLOR: "לא ניתן להוסיף צבע לא פעיל",
  COLOR_NOT_IN_MATERIAL: "הצבע שנבחר אינו שייך לחומר זה",
  DUPLICATE_MATERIAL: "לא ניתן לבחור את אותו חומר פעמיים",
  DUPLICATE_COLOR: "לא ניתן לבחור את אותו צבע פעמיים",
  EMPTY_COLORS: "יש לבחור לפחות צבע אחד לכל חומר",
} as const;

export const LEGACY_FALLBACK_HEX = "#808080";
