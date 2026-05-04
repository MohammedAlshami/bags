/**
 * One-off: insert "بوكس الشعر" package (D1 via .env.local — same as lib/db HTTP).
 *   npx tsx scripts/insert-hair-care-package.ts
 */
import { existsSync, readFileSync } from "fs";
import { randomUUID } from "crypto";
import { resolve } from "path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
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

async function main() {
  loadEnvLocal();
  const { sql } = await import("../lib/db");

  /** Order: زيت → شامبو → بلسم (matches marketing list). */
  const productIds = [
    "e0abdc46-b92f-4982-ba02-a57fe74ceb13", // زيت الملكة لتطويل وتكثيف الشعر
    "e289acb8-bbc0-471a-8e49-4efa7c5d12d4", // شامبو الملكة العضوي لعلاج الشعر
    "60b117ac-2579-41f5-8c8b-4003fa5fcef8", // بلسم الملكة للشعر طبيعي وآمن
  ];

  const name = "بوكس الشعر من منتجات الملكة";
  const description =
    "حل متكامل للعناية بشعرك بمنتجات طبيعية وآمنة تمنحك النعومة والكثافة والطول الذي تحلمين به. يحتوي البوكس على زيت الملكة لتطويل وتكثيف الشعر، وشامبو الملكة العضوي لعلاج الشعر، وبلسم الملكة.";
  const introAr = description;
  const contentsAr = JSON.stringify([
    {
      title: "زيت الملكة لتطويل وتكثيف الشعر",
      body:
        "يعالج التساقط ويغذي البصيلات ويقويها، ويوقف التساقط ويعالج القشرة، ويطوّل ويكثّف الشعر بشكل طبيعي. مكوّن من 45 نوع زيت بارد وأعشاب طبيعية.",
    },
    {
      title: "شامبو الملكة العضوي لعلاج الشعر",
      body:
        "يمنح ترطيباً عميقاً ويصلح الأضرار الناتجة عن الحرارة والعوامل البيئية، ويحمي الشعر المعالج بالبروتين والكيراتين، وينظف بلطف مع الحفاظ على النعومة واللمعان. مدعّم بفيتامين E و B5، آمن لجميع أنواع الشعر وخالٍ من السلفات والبارابين والسليكون.",
    },
    {
      title: "بلسم الملكة",
      body:
        "يرطب بعمق ويمنع الجفاف والتقصف، ويغذي فروة الرأس ويقوي البصيلات، ويسهّل التسريح ويقلّل التشابك ويمنح نعومة ولمعاناً طبيعيين. يحتوي على زيوت طبيعية وفيتامينات تغذي الشعر وتحميه، وخالٍ من المواد الضارة.",
    },
  ]);
  const closingAr = "مع بوكس الشعر من منتجات الملكة... اللمعان، النعومة، والكثافة في تجربة واحدة 💕";
  const image = "";
  const saudiRiyal = 49;
  const oldRiyal = 6900;
  const saudiRiyalBeforeDiscount: number | null = null;
  const oldRiyalBeforeDiscount: number | null = null;

  const rows = await sql`
    SELECT id FROM products
    WHERE id IN (SELECT value FROM json_each(${JSON.stringify(productIds)}))
  `;
  if (rows.length !== productIds.length) {
    throw new Error(`Expected ${productIds.length} products, found ${rows.length}`);
  }

  const existing = await sql`
    SELECT id FROM packages WHERE name = ${name} LIMIT 1
  `;
  if (existing[0]) {
    console.log("Package already exists:", (existing[0] as { id: string }).id);
    process.exit(0);
  }

  const id = randomUUID();
  await sql`
    INSERT INTO packages (
      id, name, description, image, product_ids, saudi_riyal, old_riyal,
      saudi_riyal_before_discount, old_riyal_before_discount,
      intro_ar, contents_ar, closing_ar
    )
    VALUES (
      ${id}, ${name}, ${description}, ${image}, ${JSON.stringify(productIds)}, ${saudiRiyal}, ${oldRiyal},
      ${saudiRiyalBeforeDiscount}, ${oldRiyalBeforeDiscount},
      ${introAr}, ${contentsAr}, ${closingAr}
    )
  `;
  console.log("Inserted package:", id);
  console.log("URL:", `/package/${id}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
