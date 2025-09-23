-- Create storage buckets for campaign assets
INSERT INTO storage.buckets (id, name, public) VALUES ('campaign-cover-art', 'campaign-cover-art', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('campaign-audio', 'campaign-audio', true);

-- Create RLS policies for campaign cover art bucket
CREATE POLICY "Artists can view cover art" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'campaign-cover-art');

CREATE POLICY "Artists can upload cover art for their campaigns" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'campaign-cover-art' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM campaigns 
    WHERE campaigns.id = (storage.foldername(name))[1]::uuid 
    AND campaigns.artist_id = auth.uid()
  )
);

CREATE POLICY "Artists can update cover art for their campaigns" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'campaign-cover-art' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM campaigns 
    WHERE campaigns.id = (storage.foldername(name))[1]::uuid 
    AND campaigns.artist_id = auth.uid()
  )
);

CREATE POLICY "Artists can delete cover art for their campaigns" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'campaign-cover-art' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM campaigns 
    WHERE campaigns.id = (storage.foldername(name))[1]::uuid 
    AND campaigns.artist_id = auth.uid()
  )
);

-- Create RLS policies for campaign audio bucket
CREATE POLICY "Artists can view audio files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'campaign-audio');

CREATE POLICY "Artists can upload audio for their campaigns" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'campaign-audio' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM campaigns 
    WHERE campaigns.id = (storage.foldername(name))[1]::uuid 
    AND campaigns.artist_id = auth.uid()
  )
);

CREATE POLICY "Artists can update audio for their campaigns" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'campaign-audio' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM campaigns 
    WHERE campaigns.id = (storage.foldername(name))[1]::uuid 
    AND campaigns.artist_id = auth.uid()
  )
);

CREATE POLICY "Artists can delete audio for their campaigns" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'campaign-audio' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM campaigns 
    WHERE campaigns.id = (storage.foldername(name))[1]::uuid 
    AND campaigns.artist_id = auth.uid()
  )
);