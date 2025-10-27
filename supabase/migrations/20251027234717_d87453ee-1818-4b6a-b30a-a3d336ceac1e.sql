-- Force PostgREST schema refresh by modifying column metadata
COMMENT ON COLUMN public.campaigns.achievement_badges IS 'Campaign achievement badges configuration (JSON array)';

-- Send reload signal to PostgREST to force immediate schema refresh
NOTIFY pgrst, 'reload schema';

-- Verify the column exists in the campaigns table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'campaigns' 
    AND column_name = 'achievement_badges'
  ) THEN
    RAISE EXCEPTION 'achievement_badges column not found in campaigns table';
  END IF;
  
  RAISE NOTICE 'achievement_badges column verified in campaigns table';
END $$;