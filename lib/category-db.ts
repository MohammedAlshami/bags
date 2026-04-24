import { sql } from "@/lib/db";
import { isUuid } from "@/lib/id";
import { normalizeCategoryName } from "@/lib/categories";

export type CategorySelection = {
  id: string;
  name: string;
};

export async function resolveCategorySelection(input: {
  categoryId?: unknown;
  category?: unknown;
}, fallback: CategorySelection | null = null): Promise<CategorySelection | null> {
  const rawId = input.categoryId == null ? "" : String(input.categoryId).trim();
  if (rawId) {
    if (!isUuid(rawId)) return null;
    const rows = await sql`
      SELECT id, name
      FROM categories
      WHERE id = ${rawId}::uuid
      LIMIT 1
    `;
    const row = rows[0] as CategorySelection | undefined;
    return row ?? null;
  }

  const rawName = normalizeCategoryName(input.category);
  if (rawName) {
    const rows = await sql`
      SELECT id, name
      FROM categories
      WHERE name = ${rawName}
      LIMIT 1
    `;
    const row = rows[0] as CategorySelection | undefined;
    return row ?? null;
  }

  return fallback;
}
