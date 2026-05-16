import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eq = trimmed.indexOf("=");
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim();
        const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        process.env[key] = val;
      }
    }
  }
}

const CF_ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const DB_ID      = process.env.CLOUDFLARE_DATABASE_ID;
const CF_TOKEN   = process.env.CLOUDFLARE_D1_TOKEN;

async function d1(sql, params = []) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/d1/database/${DB_ID}/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${CF_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ sql, params }),
    }
  );
  if (!res.ok) throw new Error(`D1 HTTP error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.errors?.[0]?.message ?? "D1 query failed");
  return data.result?.[0]?.results ?? [];
}

const rows = await d1("SELECT data FROM landing LIMIT 1");
const data = JSON.parse(rows[0].data);
console.log(JSON.stringify(data, null, 2));
