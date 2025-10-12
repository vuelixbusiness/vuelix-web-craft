-- Fix Security Definer View issue
-- Change views from SECURITY DEFINER to SECURITY INVOKER
-- This ensures views run with querying user's permissions, not view creator's permissions

-- Fix public_profiles view
ALTER VIEW public.public_profiles SET (security_invoker = true);

-- Fix campaign_listings view  
ALTER VIEW public.campaign_listings SET (security_invoker = true);