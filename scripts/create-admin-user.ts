/**
 * Create or reset the admin login (username + password). Loads .env.local like run-seed.
 * Usage: npx tsx scripts/create-admin-user.ts
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { hash } from "bcryptjs";

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

const ADMIN_USERNAME = "admin@admin.com";
const ADMIN_PASSWORD = "admin";

async function main() {
  const { sql } = await import("../lib/db");
  const hashed = await hash(ADMIN_PASSWORD, 10);

  const existing = await sql`
    SELECT id FROM users WHERE username = ${ADMIN_USERNAME} LIMIT 1
  `;

  if (existing.length > 0) {
    await sql`
      UPDATE users SET
        password = ${hashed},
        role = 'admin',
        email = ${ADMIN_USERNAME},
        updated_at = now()
      WHERE username = ${ADMIN_USERNAME}
    `;
    console.log("Updated admin user:", ADMIN_USERNAME);
  } else {
    await sql`
      INSERT INTO users (username, password, role, email)
      VALUES (${ADMIN_USERNAME}, ${hashed}, ${"admin"}, ${ADMIN_USERNAME})
    `;
    console.log("Created admin user:", ADMIN_USERNAME);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
