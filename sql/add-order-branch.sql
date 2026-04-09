-- Run once on Neon (after payment_proof migration if needed)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS branch_key TEXT;
