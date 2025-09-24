-- Add rules column to campaigns table for artists to define campaign-specific rules
ALTER TABLE public.campaigns 
ADD COLUMN rules TEXT;