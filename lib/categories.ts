export const DEFAULT_CATEGORY_NAMES = [
  "العناية بالبشرة",
  "العناية بالشعر",
  "العناية بالجسم",
  "العناية والجمال",
] as const;

export function normalizeCategoryName(value: unknown): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}
