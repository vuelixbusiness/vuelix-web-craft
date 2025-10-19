import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Major cities with their coordinates for globe visualization
export const CITY_LOCATIONS = {
  // North America
  'New York, USA': { lat: 40.7128, lng: -74.0060, country: 'USA', city: 'New York' },
  'Los Angeles, USA': { lat: 34.0522, lng: -118.2437, country: 'USA', city: 'Los Angeles' },
  'Chicago, USA': { lat: 41.8781, lng: -87.6298, country: 'USA', city: 'Chicago' },
  'Miami, USA': { lat: 25.7617, lng: -80.1918, country: 'USA', city: 'Miami' },
  'Atlanta, USA': { lat: 33.7490, lng: -84.3880, country: 'USA', city: 'Atlanta' },
  'San Francisco, USA': { lat: 37.7749, lng: -122.4194, country: 'USA', city: 'San Francisco' },
  'Las Vegas, USA': { lat: 36.1699, lng: -115.1398, country: 'USA', city: 'Las Vegas' },
  'Nashville, USA': { lat: 36.1627, lng: -86.7816, country: 'USA', city: 'Nashville' },
  'Austin, USA': { lat: 30.2672, lng: -97.7431, country: 'USA', city: 'Austin' },
  'Toronto, Canada': { lat: 43.6532, lng: -79.3832, country: 'Canada', city: 'Toronto' },
  'Vancouver, Canada': { lat: 49.2827, lng: -123.1207, country: 'Canada', city: 'Vancouver' },
  'Montreal, Canada': { lat: 45.5017, lng: -73.5673, country: 'Canada', city: 'Montreal' },
  'Mexico City, Mexico': { lat: 19.4326, lng: -99.1332, country: 'Mexico', city: 'Mexico City' },
  
  // South America
  'São Paulo, Brazil': { lat: -23.5505, lng: -46.6333, country: 'Brazil', city: 'São Paulo' },
  'Rio de Janeiro, Brazil': { lat: -22.9068, lng: -43.1729, country: 'Brazil', city: 'Rio de Janeiro' },
  'Buenos Aires, Argentina': { lat: -34.6037, lng: -58.3816, country: 'Argentina', city: 'Buenos Aires' },
  'Bogotá, Colombia': { lat: 4.7110, lng: -74.0721, country: 'Colombia', city: 'Bogotá' },
  'Lima, Peru': { lat: -12.0464, lng: -77.0428, country: 'Peru', city: 'Lima' },
  'Santiago, Chile': { lat: -33.4489, lng: -70.6693, country: 'Chile', city: 'Santiago' },
  
  // Europe
  'London, UK': { lat: 51.5074, lng: -0.1278, country: 'UK', city: 'London' },
  'Manchester, UK': { lat: 53.4808, lng: -2.2426, country: 'UK', city: 'Manchester' },
  'Paris, France': { lat: 48.8566, lng: 2.3522, country: 'France', city: 'Paris' },
  'Berlin, Germany': { lat: 52.5200, lng: 13.4050, country: 'Germany', city: 'Berlin' },
  'Munich, Germany': { lat: 48.1351, lng: 11.5820, country: 'Germany', city: 'Munich' },
  'Madrid, Spain': { lat: 40.4168, lng: -3.7038, country: 'Spain', city: 'Madrid' },
  'Barcelona, Spain': { lat: 41.3851, lng: 2.1734, country: 'Spain', city: 'Barcelona' },
  'Rome, Italy': { lat: 41.9028, lng: 12.4964, country: 'Italy', city: 'Rome' },
  'Milan, Italy': { lat: 45.4642, lng: 9.1900, country: 'Italy', city: 'Milan' },
  'Amsterdam, Netherlands': { lat: 52.3676, lng: 4.9041, country: 'Netherlands', city: 'Amsterdam' },
  'Stockholm, Sweden': { lat: 59.3293, lng: 18.0686, country: 'Sweden', city: 'Stockholm' },
  'Copenhagen, Denmark': { lat: 55.6761, lng: 12.5683, country: 'Denmark', city: 'Copenhagen' },
  'Oslo, Norway': { lat: 59.9139, lng: 10.7522, country: 'Norway', city: 'Oslo' },
  'Brussels, Belgium': { lat: 50.8503, lng: 4.3517, country: 'Belgium', city: 'Brussels' },
  'Vienna, Austria': { lat: 48.2082, lng: 16.3738, country: 'Austria', city: 'Vienna' },
  'Zurich, Switzerland': { lat: 47.3769, lng: 8.5417, country: 'Switzerland', city: 'Zurich' },
  'Dublin, Ireland': { lat: 53.3498, lng: -6.2603, country: 'Ireland', city: 'Dublin' },
  'Lisbon, Portugal': { lat: 38.7223, lng: -9.1393, country: 'Portugal', city: 'Lisbon' },
  'Warsaw, Poland': { lat: 52.2297, lng: 21.0122, country: 'Poland', city: 'Warsaw' },
  'Prague, Czech Republic': { lat: 50.0755, lng: 14.4378, country: 'Czech Republic', city: 'Prague' },
  'Budapest, Hungary': { lat: 47.4979, lng: 19.0402, country: 'Hungary', city: 'Budapest' },
  'Athens, Greece': { lat: 37.9838, lng: 23.7275, country: 'Greece', city: 'Athens' },
  'Istanbul, Turkey': { lat: 41.0082, lng: 28.9784, country: 'Turkey', city: 'Istanbul' },
  'Moscow, Russia': { lat: 55.7558, lng: 37.6173, country: 'Russia', city: 'Moscow' },
  
  // Africa
  'Lagos, Nigeria': { lat: 6.5244, lng: 3.3792, country: 'Nigeria', city: 'Lagos' },
  'Cairo, Egypt': { lat: 30.0444, lng: 31.2357, country: 'Egypt', city: 'Cairo' },
  'Johannesburg, South Africa': { lat: -26.2041, lng: 28.0473, country: 'South Africa', city: 'Johannesburg' },
  'Cape Town, South Africa': { lat: -33.9249, lng: 18.4241, country: 'South Africa', city: 'Cape Town' },
  'Nairobi, Kenya': { lat: -1.2921, lng: 36.8219, country: 'Kenya', city: 'Nairobi' },
  'Accra, Ghana': { lat: 5.6037, lng: -0.1870, country: 'Ghana', city: 'Accra' },
  'Casablanca, Morocco': { lat: 33.5731, lng: -7.5898, country: 'Morocco', city: 'Casablanca' },
  'Addis Ababa, Ethiopia': { lat: 9.0320, lng: 38.7469, country: 'Ethiopia', city: 'Addis Ababa' },
  
  // Asia
  'Tokyo, Japan': { lat: 35.6762, lng: 139.6503, country: 'Japan', city: 'Tokyo' },
  'Osaka, Japan': { lat: 34.6937, lng: 135.5023, country: 'Japan', city: 'Osaka' },
  'Seoul, South Korea': { lat: 37.5665, lng: 126.9780, country: 'South Korea', city: 'Seoul' },
  'Beijing, China': { lat: 39.9042, lng: 116.4074, country: 'China', city: 'Beijing' },
  'Shanghai, China': { lat: 31.2304, lng: 121.4737, country: 'China', city: 'Shanghai' },
  'Hong Kong': { lat: 22.3193, lng: 114.1694, country: 'Hong Kong', city: 'Hong Kong' },
  'Shenzhen, China': { lat: 22.5431, lng: 114.0579, country: 'China', city: 'Shenzhen' },
  'Mumbai, India': { lat: 19.0760, lng: 72.8777, country: 'India', city: 'Mumbai' },
  'Delhi, India': { lat: 28.7041, lng: 77.1025, country: 'India', city: 'Delhi' },
  'Bangalore, India': { lat: 12.9716, lng: 77.5946, country: 'India', city: 'Bangalore' },
  'Bangkok, Thailand': { lat: 13.7563, lng: 100.5018, country: 'Thailand', city: 'Bangkok' },
  'Singapore': { lat: 1.3521, lng: 103.8198, country: 'Singapore', city: 'Singapore' },
  'Dubai, UAE': { lat: 25.2048, lng: 55.2708, country: 'UAE', city: 'Dubai' },
  'Abu Dhabi, UAE': { lat: 24.4539, lng: 54.3773, country: 'UAE', city: 'Abu Dhabi' },
  'Tel Aviv, Israel': { lat: 32.0853, lng: 34.7818, country: 'Israel', city: 'Tel Aviv' },
  'Kuala Lumpur, Malaysia': { lat: 3.1390, lng: 101.6869, country: 'Malaysia', city: 'Kuala Lumpur' },
  'Jakarta, Indonesia': { lat: -6.2088, lng: 106.8456, country: 'Indonesia', city: 'Jakarta' },
  'Manila, Philippines': { lat: 14.5995, lng: 120.9842, country: 'Philippines', city: 'Manila' },
  'Hanoi, Vietnam': { lat: 21.0285, lng: 105.8542, country: 'Vietnam', city: 'Hanoi' },
  'Ho Chi Minh City, Vietnam': { lat: 10.8231, lng: 106.6297, country: 'Vietnam', city: 'Ho Chi Minh City' },
  'Taipei, Taiwan': { lat: 25.0330, lng: 121.5654, country: 'Taiwan', city: 'Taipei' },
  'Riyadh, Saudi Arabia': { lat: 24.7136, lng: 46.6753, country: 'Saudi Arabia', city: 'Riyadh' },
  
  // Oceania
  'Sydney, Australia': { lat: -33.8688, lng: 151.2093, country: 'Australia', city: 'Sydney' },
  'Melbourne, Australia': { lat: -37.8136, lng: 144.9631, country: 'Australia', city: 'Melbourne' },
  'Brisbane, Australia': { lat: -27.4698, lng: 153.0251, country: 'Australia', city: 'Brisbane' },
  'Perth, Australia': { lat: -31.9505, lng: 115.8605, country: 'Australia', city: 'Perth' },
  'Auckland, New Zealand': { lat: -36.8485, lng: 174.7633, country: 'New Zealand', city: 'Auckland' },
  'Wellington, New Zealand': { lat: -41.2865, lng: 174.7762, country: 'New Zealand', city: 'Wellington' },
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

  useEffect(() => {
    setSelectedLocation(value || '');
  }, [value]);

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
