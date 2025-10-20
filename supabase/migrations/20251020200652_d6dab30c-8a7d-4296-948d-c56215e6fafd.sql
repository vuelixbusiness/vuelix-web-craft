-- First, delete campaigns with artist_ids that don't exist in profiles
DELETE FROM public.campaigns 
WHERE artist_id NOT IN (SELECT id FROM public.profiles);

-- Now add the foreign key constraint
ALTER TABLE public.campaigns
ADD CONSTRAINT campaigns_artist_id_fkey 
FOREIGN KEY (artist_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;