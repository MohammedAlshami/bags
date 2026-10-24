/**
 * Repoints image URLs stored in site-content tables from the throttled r2.dev host to the CDN domain.
 * Run ONLY after the code that allows the CDN host (next.config.ts) is deployed.
 *
 *   node scripts/switch-r2-host.mjs              # dry run: counts rows that would change
 *   node scripts/switch-r2-host.mjs --apply      # rewrite
 *   node scripts/switch-r2-host.mjs --rollback   # point back at r2.dev
 *
 * Orders and users are left alone (their old r2.dev links keep working).
 */
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const OLD = "https://pub-9f312be7e4a94c53b384bfcf5701085e.r2.dev";
const NEW = "https://cdn.goldqueen.store";
const rollback = process.argv.includes("--rollback");
const apply = process.argv.includes("--apply") || rollback;
const [from, to] = rollback ? [NEW, OLD] : [OLD, NEW];
const SKIP = new Set(["orders", "users", "d1_migrations", "sqlite_sequence"]);

async function d1(sql, params = []) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${env.CLOUDFLARE_DATABASE_ID}/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${env.CLOUDFLARE_D1_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ sql, params }),
    },
  );
  const json = await res.json();
  if (!json.success) throw new Error(JSON.stringify(json.errors));
  return json.result[0].results ?? [];
}

const tables = (await d1("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'"))
  .map((r) => r.name)
  .filter((t) => !SKIP.has(t));

let rows = 0;
for (const t of tables) {
  for (const c of await d1(`PRAGMA table_info("${t}")`)) {
    if (!/TEXT|CHAR|CLOB|^$/i.test(c.type || "")) continue;
    const hits = await d1(`SELECT rowid AS rid, "${c.name}" AS v FROM "${t}" WHERE instr("${c.name}", ?) > 0`, [from]);
    for (const h of hits) {
      rows += 1;
      console.log(`${apply ? "update" : "would update"}: ${t}.${c.name} rowid=${h.rid}`);
      if (apply) await d1(`UPDATE "${t}" SET "${c.name}" = ? WHERE rowid = ?`, [String(h.v).split(from).join(to), h.rid]);
    }
  }
}
console.log(`\n${rows} row(s) ${apply ? "updated" : "would change"}: ${from} -> ${to}${apply ? "" : "  (dry run, re-run with --apply)"}`);
