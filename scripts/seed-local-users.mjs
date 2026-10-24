/**
 * Creates local-only test accounts in the LOCAL D1 database (.wrangler/local-state) used by `npm run dev:local`.
 * Never touches production. Usage: node scripts/seed-local-users.mjs
 *
 *   superadmin  login: local-admin     password: LocalDev!2026
 *   customer    login: local-customer  password: LocalDev!2026  (province: Taiz, phone 700000001)
 */
import { execFileSync } from "node:child_process";
import bcrypt from "bcryptjs";

const hash = bcrypt.hashSync("LocalDev!2026", 10);
const sql = `
DELETE FROM users WHERE username IN ('local-admin', 'local-customer');
INSERT INTO users (id, username, password, role, email, full_name, address, phone, province_id)
VALUES ('local-admin-id', 'local-admin', '${hash}', 'superadmin', 'admin@local.test', 'Local Admin', '', '700000000', NULL);
INSERT INTO users (id, username, password, role, email, full_name, address, phone, province_id)
VALUES ('local-customer-id', 'local-customer', '${hash}', 'customer', 'customer@local.test', 'Local Customer', 'تعز - شارع جمال - قرب المدرسة', '700000001', 'taiz');
`;
execFileSync(
  "npx",
  ["wrangler", "d1", "execute", "goldqueen-local", "--local", "--config", "wrangler.local.jsonc", "--persist-to", ".wrangler/local-state", "--command", sql.replace(/\n/g, " ")],
  { stdio: "inherit" },
);
