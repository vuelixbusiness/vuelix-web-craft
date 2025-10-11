import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Major cities with their coordinates for globe visualization
export const CITY_LOCATIONS = {
  // North America
  'New York, USA': { lat: 40.7128, lng: -74.0060, country: 'USA', city: 'New York' },
  'Los Angeles, USA': { lat: 34.0522, lng: -118.2437, country: 'USA', city: 'Los Angeles' },
  'Miami, USA': { lat: 25.7617, lng: -80.1918, country: 'USA', city: 'Miami' },
  'Toronto, Canada': { lat: 43.6532, lng: -79.3832, country: 'Canada', city: 'Toronto' },
  'Mexico City, Mexico': { lat: 19.4326, lng: -99.1332, country: 'Mexico', city: 'Mexico City' },
  
  // South America
  'São Paulo, Brazil': { lat: -23.5505, lng: -46.6333, country: 'Brazil', city: 'São Paulo' },
  'Buenos Aires, Argentina': { lat: -34.6037, lng: -58.3816, country: 'Argentina', city: 'Buenos Aires' },
  'Bogotá, Colombia': { lat: 4.7110, lng: -74.0721, country: 'Colombia', city: 'Bogotá' },
  
  // Europe
  'London, UK': { lat: 51.5074, lng: -0.1278, country: 'UK', city: 'London' },
  'Paris, France': { lat: 48.8566, lng: 2.3522, country: 'France', city: 'Paris' },
  'Berlin, Germany': { lat: 52.5200, lng: 13.4050, country: 'Germany', city: 'Berlin' },
  'Madrid, Spain': { lat: 40.4168, lng: -3.7038, country: 'Spain', city: 'Madrid' },
  'Rome, Italy': { lat: 41.9028, lng: 12.4964, country: 'Italy', city: 'Rome' },
  'Amsterdam, Netherlands': { lat: 52.3676, lng: 4.9041, country: 'Netherlands', city: 'Amsterdam' },
  'Stockholm, Sweden': { lat: 59.3293, lng: 18.0686, country: 'Sweden', city: 'Stockholm' },
  
  // Africa
  'Lagos, Nigeria': { lat: 6.5244, lng: 3.3792, country: 'Nigeria', city: 'Lagos' },
  'Cairo, Egypt': { lat: 30.0444, lng: 31.2357, country: 'Egypt', city: 'Cairo' },
  'Johannesburg, South Africa': { lat: -26.2041, lng: 28.0473, country: 'South Africa', city: 'Johannesburg' },
  'Nairobi, Kenya': { lat: -1.2921, lng: 36.8219, country: 'Kenya', city: 'Nairobi' },
  
  // Asia
  'Tokyo, Japan': { lat: 35.6762, lng: 139.6503, country: 'Japan', city: 'Tokyo' },
  'Seoul, South Korea': { lat: 37.5665, lng: 126.9780, country: 'South Korea', city: 'Seoul' },
  'Beijing, China': { lat: 39.9042, lng: 116.4074, country: 'China', city: 'Beijing' },
  'Shanghai, China': { lat: 31.2304, lng: 121.4737, country: 'China', city: 'Shanghai' },
  'Mumbai, India': { lat: 19.0760, lng: 72.8777, country: 'India', city: 'Mumbai' },
  'Delhi, India': { lat: 28.7041, lng: 77.1025, country: 'India', city: 'Delhi' },
  'Bangkok, Thailand': { lat: 13.7563, lng: 100.5018, country: 'Thailand', city: 'Bangkok' },
  'Singapore': { lat: 1.3521, lng: 103.8198, country: 'Singapore', city: 'Singapore' },
  'Dubai, UAE': { lat: 25.2048, lng: 55.2708, country: 'UAE', city: 'Dubai' },
  'Tel Aviv, Israel': { lat: 32.0853, lng: 34.7818, country: 'Israel', city: 'Tel Aviv' },
  
  // Oceania
  'Sydney, Australia': { lat: -33.8688, lng: 151.2093, country: 'Australia', city: 'Sydney' },
  'Melbourne, Australia': { lat: -37.8136, lng: 144.9631, country: 'Australia', city: 'Melbourne' },
  'Auckland, New Zealand': { lat: -36.8485, lng: 174.7633, country: 'New Zealand', city: 'Auckland' },
};

interface LocationSelectorProps {
  value?: string;
  onLocationChange: (location: { city: string; country: string; lat: number; lng: number }) => void;
  label?: string;
  placeholder?: string;
}

export const LocationSelector = ({ 
  value, 
  onLocationChange, 
  label = "Location",
  placeholder = "Select your city"
}: LocationSelectorProps) => {
  const [selectedLocation, setSelectedLocation] = useState<string>(value || '');

  const handleChange = (locationKey: string) => {
    setSelectedLocation(locationKey);
    const location = CITY_LOCATIONS[locationKey as keyof typeof CITY_LOCATIONS];
    if (location) {
      onLocationChange({
        city: location.city,
        country: location.country,
        lat: location.lat,
        lng: location.lng
      });
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="location">{label}</Label>
      <Select value={selectedLocation} onValueChange={handleChange}>
        <SelectTrigger id="location">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(CITY_LOCATIONS).map((locationKey) => (
            <SelectItem key={locationKey} value={locationKey}>
              {locationKey}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
