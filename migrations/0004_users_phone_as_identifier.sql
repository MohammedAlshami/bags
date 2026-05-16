-- Migration 0004: Make phone the primary identifier for customers.
-- username column is repurposed to store the phone number for customer accounts.
-- email column is kept (nullable) but no longer required or used for auth.

-- No structural ALTER needed: phone column already exists.
-- This migration is a no-op DDL change; the app code now uses phone as the login key.
-- Existing rows with email-as-username are unaffected for admin accounts.

-- Optional: create a unique index on phone for customer rows (advisory — D1 supports this)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users (phone) WHERE phone IS NOT NULL AND phone != '';
