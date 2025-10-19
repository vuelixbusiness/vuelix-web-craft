import { useState } from 'react';
import { MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { CITY_LOCATIONS } from '@/components/LocationSelector';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function LocationPopover() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MapPin className="w-4 h-4" />
          My Location
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]" align="start">
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
