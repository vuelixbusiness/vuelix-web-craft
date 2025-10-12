-- Fix portfolio content type constraint to allow 'portfolio' and 'document' types
ALTER TABLE public.user_content_showcase
DROP CONSTRAINT user_content_showcase_content_type_check;

ALTER TABLE public.user_content_showcase
ADD CONSTRAINT user_content_showcase_content_type_check
CHECK (content_type IN ('video', 'image', 'audio', 'document', 'portfolio', 'post', 'campaign'));