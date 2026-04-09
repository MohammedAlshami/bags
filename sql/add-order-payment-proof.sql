-- Run once against your Neon DB (e.g. psql or Neon SQL editor)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;
