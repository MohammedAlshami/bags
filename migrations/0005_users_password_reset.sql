-- Migration 0005: Add password reset token columns to users table.
-- Run via: npx wrangler d1 migrations apply goldqueen --remote

ALTER TABLE users ADD COLUMN password_reset_token TEXT;
ALTER TABLE users ADD COLUMN password_reset_expires TEXT;
