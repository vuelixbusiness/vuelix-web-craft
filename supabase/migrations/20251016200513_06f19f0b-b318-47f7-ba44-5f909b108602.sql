-- Make payout_type nullable for service campaigns (get_rewarded mode)
-- Service campaigns don't offer payouts, so payout_type should be optional
ALTER TABLE campaigns 
ALTER COLUMN payout_type DROP NOT NULL;