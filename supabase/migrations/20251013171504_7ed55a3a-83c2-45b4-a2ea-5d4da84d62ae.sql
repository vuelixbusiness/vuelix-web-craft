-- Add fixed_rate_description column to campaigns table
ALTER TABLE public.campaigns 
ADD COLUMN fixed_rate_description text;