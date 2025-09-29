-- Just add the payment provider fields for now, skip wallet creation

-- Add payment provider fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_account_status TEXT DEFAULT 'not_connected',
ADD COLUMN IF NOT EXISTS paypal_email TEXT,
ADD COLUMN IF NOT EXISTS paypal_account_status TEXT DEFAULT 'not_connected';

-- Add validation constraints for payout requests
DO $$ 
BEGIN
    -- Add constraints if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'check_minimum_payout_amount' AND table_name = 'payout_requests') THEN
        ALTER TABLE payout_requests ADD CONSTRAINT check_minimum_payout_amount CHECK (amount >= 5.00);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'check_valid_payment_method' AND table_name = 'payout_requests') THEN
        ALTER TABLE payout_requests ADD CONSTRAINT check_valid_payment_method CHECK (method IN ('stripe', 'paypal'));
    END IF;
END $$;