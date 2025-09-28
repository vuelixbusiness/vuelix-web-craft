-- Add DELETE policy for campaigns table to allow artists to delete their own terminated campaigns
CREATE POLICY "Artists can delete their own terminated campaigns"
ON campaigns FOR DELETE
USING (
  auth.uid() = artist_id AND 
  status = 'terminated'
);