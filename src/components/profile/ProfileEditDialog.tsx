import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocationSelector, CITY_LOCATIONS } from "@/components/LocationSelector";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { USER_TYPES } from "@/config/userTypes";
import { cn } from "@/lib/utils";

interface ProfileEditDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileEditDialog({ open, onClose }: ProfileEditDialogProps) {
  const { user, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    user_type: '',
    bio: '',
    location: '',
    city: '',
    country: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });

  useEffect(() => {
    if (user && open) {
      // Fetch full profile data including location fields
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, username, user_type, bio, city, country, latitude, longitude')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        // Find matching location key if city and country exist
        let locationKey = '';
        if (data.city && data.country) {
          locationKey = Object.keys(CITY_LOCATIONS).find(key => {
            const loc = CITY_LOCATIONS[key as keyof typeof CITY_LOCATIONS];
            return loc.city === data.city && loc.country === data.country;
          }) || '';
        }

        setFormData({
          name: data.display_name || '',
          username: data.username || '',
          user_type: data.user_type || '',
          bio: data.bio || '',
          location: locationKey,
          city: data.city || '',
          country: data.country || '',
          latitude: data.latitude,
          longitude: data.longitude,
        });
      };

      fetchProfile();
    }
  }, [user, open]);

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.name,
          username: formData.username,
          user_type: formData.user_type,
          bio: formData.bio,
          city: formData.city,
          country: formData.country,
          latitude: formData.latitude,
          longitude: formData.longitude,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      await refreshUserProfile();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Enter your username"
            />
          </div>
          <div className="space-y-2">
            <Label>User Badge</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {USER_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, user_type: type.id }))}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-lg border-2 transition-all hover:scale-105",
                    formData.user_type === type.id 
                      ? "border-primary bg-primary/10" 
                      : "border-border bg-card hover:bg-accent"
                  )}
                >
                  <span className="text-3xl mb-1">{type.icon}</span>
                  <span className="text-xs text-center text-foreground">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
          <LocationSelector
            value={formData.location}
            onLocationChange={(location) => {
              setFormData(prev => ({
                ...prev,
                city: location.city,
                country: location.country,
                latitude: location.lat,
                longitude: location.lng,
                location: `${location.city}, ${location.country}`
              }));
            }}
            label="Location (for globe display)"
            placeholder="Select your city to appear on the globe"
          />
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
