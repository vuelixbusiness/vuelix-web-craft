-- Make payout_rate nullable to support different campaign reward types
-- Performance-based campaigns use payout_rate
-- Fixed-rate and hybrid campaigns use description fields instead
ALTER TABLE campaigns ALTER COLUMN payout_rate DROP NOT NULL;