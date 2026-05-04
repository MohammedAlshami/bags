/**
 * Applies float price migrations (0002 → data backfill → 0003) using the D1 HTTP API
 * (`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DATABASE_ID`, `CLOUDFLARE_D1_TOKEN` in `.env.local`).
 * Use when Wrangler is unavailable (no `CLOUDFLARE_API_TOKEN`).
 *
 *   npx tsx scripts/ensure-d1-price-migrations.ts
 */
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

type SqlPrimitive = string | number | boolean | null;

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

function getReq(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

async function d1ExecIgnoreDuplicateColumn(sql: string): Promise<void> {
  try {
    await d1Query(sql);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!/duplicate column name/i.test(msg)) throw e;
  }
}

async function d1Query(sql: string, params: SqlPrimitive[] = []): Promise<Record<string, unknown>[]> {
  const accountId = getReq("CLOUDFLARE_ACCOUNT_ID");
  const databaseId = getReq("CLOUDFLARE_DATABASE_ID");
  const token = getReq("CLOUDFLARE_D1_TOKEN");

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    },
  );

  if (!res.ok) {
    throw new Error(`D1 query failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    success?: boolean;
    errors?: Array<{ message?: string }>;
    result?: Array<{ success?: boolean; results?: Record<string, unknown>[] }>;
  };

  if (!data.success) {
    throw new Error(data.errors?.[0]?.message ?? "D1 query failed");
  }

  const result = data.result?.[0];
  if (!result?.success) {
    throw new Error("D1 statement failed");
  }

  return result.results ?? [];
}

async function hasColumn(table: "products" | "packages", col: string): Promise<boolean> {
  const pragma = table === "products" ? "PRAGMA table_info(products)" : "PRAGMA table_info(packages)";
  const rows = await d1Query(pragma);
  return rows.some((r) => String(r.name) === col);
}

async function d1ExecIgnoreNoSuchColumn(sql: string): Promise<void> {
  try {
    await d1Query(sql);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!/no such column/i.test(msg)) throw e;
  }
}

async function main() {
  loadEnvLocal();

  const productsHasSaudi = await hasColumn("products", "saudi_riyal");
  const packagesHasSaudi = await hasColumn("packages", "saudi_riyal");
  if (!productsHasSaudi || !packagesHasSaudi) {
    console.log("Applying migration 0002 (add float columns)…");
    if (!productsHasSaudi) {
      await d1ExecIgnoreDuplicateColumn("ALTER TABLE products ADD COLUMN saudi_riyal REAL");
      await d1ExecIgnoreDuplicateColumn("ALTER TABLE products ADD COLUMN saudi_riyal_before_discount REAL");
      await d1ExecIgnoreDuplicateColumn("ALTER TABLE products ADD COLUMN old_riyal_before_discount REAL");
      if (await hasColumn("products", "before_discount_old_riyal")) {
        await d1Query(
          "UPDATE products SET old_riyal_before_discount = before_discount_old_riyal WHERE before_discount_old_riyal IS NOT NULL",
        );
      }
    }
    if (!packagesHasSaudi) {
      await d1ExecIgnoreDuplicateColumn("ALTER TABLE packages ADD COLUMN saudi_riyal REAL");
      await d1ExecIgnoreDuplicateColumn("ALTER TABLE packages ADD COLUMN saudi_riyal_before_discount REAL");
      await d1ExecIgnoreDuplicateColumn("ALTER TABLE packages ADD COLUMN old_riyal_before_discount REAL");
      if (await hasColumn("packages", "before_discount_old_riyal")) {
        await d1Query(
          "UPDATE packages SET old_riyal_before_discount = before_discount_old_riyal WHERE before_discount_old_riyal IS NOT NULL",
        );
      }
    }
    console.log("0002 done.");
  } else {
    console.log("0002 already applied (saudi_riyal exists on products and packages).");
  }

  if (await hasColumn("products", "price")) {
    console.log("Backfilling saudi_riyal from legacy strings…");
    execSync("npx tsx scripts/migrate-prices-to-floats.ts", { stdio: "inherit", cwd: process.cwd() });
  } else {
    console.log("Skipping backfill (legacy price column already dropped).");
  }

  const hasLegacyPrice = await hasColumn("products", "price");
  if (hasLegacyPrice) {
    console.log("Applying migration 0003 (drop legacy string columns)…");
    const drops = [
      "ALTER TABLE products DROP COLUMN price",
      "ALTER TABLE products DROP COLUMN before_discount_price",
      "ALTER TABLE products DROP COLUMN before_discount_old_riyal",
      "ALTER TABLE packages DROP COLUMN price",
      "ALTER TABLE packages DROP COLUMN before_discount_price",
      "ALTER TABLE packages DROP COLUMN before_discount_old_riyal",
    ];
    for (const s of drops) {
      await d1ExecIgnoreNoSuchColumn(s);
    }
    console.log("0003 done.");
  } else {
    console.log("0003 already applied (no legacy price column on products).");
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
