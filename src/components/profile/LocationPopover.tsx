import { useState, useEffect } from 'react';
import { MapPin, Check, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { CITY_LOCATIONS } from '@/components/LocationSelector';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function LocationPopover() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [shareOnGlobe, setShareOnGlobe] = useState(false);

  useEffect(() => {
    const fetchShareStatus = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('share_location_on_globe')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setShareOnGlobe(data.share_location_on_globe || false);
      }
    };
    
    fetchShareStatus();
  }, [user?.id]);

  const handleLocationSelect = async (locationKey: string) => {
    const location = CITY_LOCATIONS[locationKey as keyof typeof CITY_LOCATIONS];
    if (!location || !user?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          location: locationKey,
          city: location.city,
          country: location.country,
          latitude: location.lat,
          longitude: location.lng,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Location updated',
        description: `Your location has been set to ${locationKey}`,
      });
      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: 'Error',
        description: 'Failed to update location. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareToggle = async (checked: boolean) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ share_location_on_globe: checked })
        .eq('user_id', user.id);

      if (error) throw error;

      setShareOnGlobe(checked);
      toast({
        title: checked ? 'Location sharing enabled' : 'Location sharing disabled',
        description: checked 
          ? 'Your location is now visible on the Discover globe'
          : 'Your location has been hidden from the Discover globe',
      });
    } catch (error) {
      console.error('Error updating location sharing:', error);
      toast({
        title: 'Error',
        description: 'Failed to update location sharing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MapPin className="w-4 h-4" />
          My Location
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[320px]" align="start">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="share-location" className="text-sm font-medium cursor-pointer">
                Share on Discover Globe
              </Label>
            </div>
            <Switch
              id="share-location"
              checked={shareOnGlobe}
              onCheckedChange={handleShareToggle}
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Show your location to other users on the global map
          </p>
        </div>
        <Command>
          <CommandInput placeholder="Search location..." />
          <CommandList>
            <CommandEmpty>No location found.</CommandEmpty>
            <CommandGroup heading="Select your location">
              {Object.keys(CITY_LOCATIONS).map((locationKey) => {
                const isSelected = user?.location === locationKey;
                return (
                  <CommandItem
                    key={locationKey}
                    value={locationKey}
                    onSelect={() => handleLocationSelect(locationKey)}
                    disabled={isLoading}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        isSelected ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    {locationKey}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
