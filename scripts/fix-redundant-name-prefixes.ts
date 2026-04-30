/**
 * One-off: strip redundant "shortArabic: longerArabic" name prefixes.
 * Skips names where the part after ":" is primarily English (bilingual titles).
 * Each UPDATE is guarded by exact previous `name` match on that `id`.
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eq = trimmed.indexOf("=");
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        process.env[key] = value;
      }
    }
  }
}

/** [id, exactCurrentName, newName] — from products-d1-export.json before this script */
const RENAMES: [string, string, string][] = [
  [
    "6c3739c6-f8e9-43b2-9904-21551588737c",
    "أعشاب التخسيس: أعشاب التخسيس وإنقاص الوزن",
    "أعشاب التخسيس وإنقاص الوزن",
  ],
  [
    "60b117ac-2579-41f5-8c8b-4003fa5fcef8",
    "البلسم: بلسم الملكة للشعر طبيعي وآمن",
    "بلسم الملكة للشعر طبيعي وآمن",
  ],
  [
    "f26d436b-e6bc-4c24-ad40-5ef4f9013869",
    "اللوشن: لوشن الملكة لترطيب الجسم والوجة",
    "لوشن الملكة لترطيب الجسم والوجة",
  ],
  [
    "d86baddf-a848-4527-be52-1c4b7f078369",
    "باكج العناية بالشعر: بوكس الشعر من منتجات الملكة",
    "بوكس الشعر من منتجات الملكة",
  ],
  [
    "4a9045ae-21b3-4438-9078-287d9bce1569",
    "بودر تسمين الخدود: بودر تسمين الخدود الطبيعي",
    "بودر تسمين الخدود الطبيعي",
  ],
  [
    "e0abdc46-b92f-4982-ba02-a57fe74ceb13",
    "زيت الشعر: زيت الملكة لتطويل وتكثيف الشعر",
    "زيت الملكة لتطويل وتكثيف الشعر",
  ],
  [
    "e008e5e3-78ef-44fa-a046-db55b5c90675",
    "سيروم الهالات: سيروم الملكة للهالات",
    "سيروم الملكة للهالات",
  ],
  [
    "e289acb8-bbc0-471a-8e49-4efa7c5d12d4",
    "شامبو: شامبو الملكة العضوي لعلاج الشعر",
    "شامبو الملكة العضوي لعلاج الشعر",
  ],
  [
    "ea56fec4-ad99-4202-879d-df329da2d3ff",
    "عسل التسمين: عسل تسمين الجسم الطبيعي",
    "عسل تسمين الجسم الطبيعي",
  ],
  [
    "cb8b5f41-6410-409c-9d86-e886c515f14d",
    "كريم الأنف: كريم امتصاص دهون الأنف ومعالج المسام",
    "كريم امتصاص دهون الأنف ومعالج المسام",
  ],
  [
    "b78d347b-8c78-4575-8a84-5c99d460d2f3",
    "ماسك البشرة: ماسك الملكة البديل",
    "ماسك الملكة البديل",
  ],
  [
    "8b31d8a0-1388-4142-b61b-6e80c97cdb91",
    "مياة الميسلار: مياه الميسلار لإزالة المكياج وتنظيف المسام",
    "مياه الميسلار لإزالة المكياج وتنظيف المسام",
  ],
];

async function main() {
  const { sql } = await import("../lib/db");
  for (const [id, was, next] of RENAMES) {
    await sql`
      UPDATE products
      SET name = ${next}, updated_at = now()
      WHERE id = ${id}::uuid AND name = ${was}
    `;
    const rows = await sql`SELECT name FROM products WHERE id = ${id}::uuid LIMIT 1`;
    const cur = (rows[0] as { name?: string } | undefined)?.name ?? "";
    if (cur !== next) {
      console.warn(`SKIP id=${id}: wanted "${next}", got "${cur}" (expected old name "${was}")`);
    } else {
      console.log(`OK id=${id}\n  "${was}" → "${next}"`);
    }
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
