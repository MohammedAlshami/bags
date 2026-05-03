-- Prefer Wrangler migrations: migrations/0001_add_user_province_id.sql
--   npx wrangler d1 migrations apply goldqueen --remote
-- Or execute this once manually on D1 / SQLite:
ALTER TABLE users ADD COLUMN province_id TEXT;
