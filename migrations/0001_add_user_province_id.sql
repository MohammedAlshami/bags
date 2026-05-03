-- Adds checkout / profile province for customers (run via: wrangler d1 migrations apply goldqueen --remote)
ALTER TABLE users ADD COLUMN province_id TEXT;
