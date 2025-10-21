-- Allow anonymous users to view public profiles with locations for the globe
CREATE POLICY "Anonymous users can view public globe locations"
ON profiles
FOR SELECT
TO anon
USING (
  public_visibility = true 
  AND share_location_on_globe = true
  AND latitude IS NOT NULL 
  AND longitude IS NOT NULL
);