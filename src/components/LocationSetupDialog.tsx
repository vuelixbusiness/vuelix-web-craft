import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LocationSelector } from "@/components/LocationSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Globe } from "lucide-react";

interface LocationSetupDialogProps {
  open: boolean;
  userId: string;
  onComplete: () => void;
}

export function LocationSetupDialog({ open, userId, onComplete }: LocationSetupDialogProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    city: string;
    country: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!selectedLocation) {
      toast({
        title: "Please select a location",
        description: "Choose your city to appear on our global community map",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          city: selectedLocation.city,
          country: selectedLocation.country,
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Location saved!",
        description: "You'll now appear on our global community map",
      });
      
      onComplete();
    } catch (error) {
      console.error('Error saving location:', error);
      toast({
        title: "Error",
        description: "Failed to save location. You can set it later in your profile.",
        variant: "destructive",
      });
      // Allow to continue even if there's an error
      setCanSkip(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    toast({
      title: "Location skipped",
      description: "You can set your location anytime in your profile settings",
    });
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Globe className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Welcome to Vuelix!</DialogTitle>
          <DialogDescription className="text-center">
            Where are you located? Your location will be displayed on our interactive globe,
            connecting you with creators and artists worldwide.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <LocationSelector
            onLocationChange={(location) => setSelectedLocation(location)}
            label="Select your location"
            placeholder="Choose your city"
          />
          
          <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="text-sm text-muted-foreground">
              📍 Your location will help:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4">
              <li>• Connect you with nearby creators and artists</li>
              <li>• Display your presence on our global community map</li>
              <li>• Help artists find local talent for campaigns</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isLoading && !canSkip}
            className="w-full sm:w-auto"
          >
            Skip for now
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !selectedLocation}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Saving..." : "Save Location"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
