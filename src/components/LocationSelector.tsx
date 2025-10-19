import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Major cities with their coordinates for globe visualization
export const CITY_LOCATIONS = {
  // United States (Expanded)
  'New York, USA': { lat: 40.7128, lng: -74.0060, country: 'USA', city: 'New York' },
  'Los Angeles, USA': { lat: 34.0522, lng: -118.2437, country: 'USA', city: 'Los Angeles' },
  'Chicago, USA': { lat: 41.8781, lng: -87.6298, country: 'USA', city: 'Chicago' },
  'Houston, USA': { lat: 29.7604, lng: -95.3698, country: 'USA', city: 'Houston' },
  'Phoenix, USA': { lat: 33.4484, lng: -112.0740, country: 'USA', city: 'Phoenix' },
  'Philadelphia, USA': { lat: 39.9526, lng: -75.1652, country: 'USA', city: 'Philadelphia' },
  'San Antonio, USA': { lat: 29.4241, lng: -98.4936, country: 'USA', city: 'San Antonio' },
  'San Diego, USA': { lat: 32.7157, lng: -117.1611, country: 'USA', city: 'San Diego' },
  'Dallas, USA': { lat: 32.7767, lng: -96.7970, country: 'USA', city: 'Dallas' },
  'San Jose, USA': { lat: 37.3382, lng: -121.8863, country: 'USA', city: 'San Jose' },
  'Austin, USA': { lat: 30.2672, lng: -97.7431, country: 'USA', city: 'Austin' },
  'Jacksonville, USA': { lat: 30.3322, lng: -81.6557, country: 'USA', city: 'Jacksonville' },
  'Fort Worth, USA': { lat: 32.7555, lng: -97.3308, country: 'USA', city: 'Fort Worth' },
  'Columbus, USA': { lat: 39.9612, lng: -82.9988, country: 'USA', city: 'Columbus' },
  'San Francisco, USA': { lat: 37.7749, lng: -122.4194, country: 'USA', city: 'San Francisco' },
  'Charlotte, USA': { lat: 35.2271, lng: -80.8431, country: 'USA', city: 'Charlotte' },
  'Indianapolis, USA': { lat: 39.7684, lng: -86.1581, country: 'USA', city: 'Indianapolis' },
  'Seattle, USA': { lat: 47.6062, lng: -122.3321, country: 'USA', city: 'Seattle' },
  'Denver, USA': { lat: 39.7392, lng: -104.9903, country: 'USA', city: 'Denver' },
  'Washington DC, USA': { lat: 38.9072, lng: -77.0369, country: 'USA', city: 'Washington DC' },
  'Boston, USA': { lat: 42.3601, lng: -71.0589, country: 'USA', city: 'Boston' },
  'Nashville, USA': { lat: 36.1627, lng: -86.7816, country: 'USA', city: 'Nashville' },
  'Baltimore, USA': { lat: 39.2904, lng: -76.6122, country: 'USA', city: 'Baltimore' },
  'Oklahoma City, USA': { lat: 35.4676, lng: -97.5164, country: 'USA', city: 'Oklahoma City' },
  'Las Vegas, USA': { lat: 36.1699, lng: -115.1398, country: 'USA', city: 'Las Vegas' },
  'Portland, USA': { lat: 45.5152, lng: -122.6784, country: 'USA', city: 'Portland' },
  'Memphis, USA': { lat: 35.1495, lng: -90.0490, country: 'USA', city: 'Memphis' },
  'Detroit, USA': { lat: 42.3314, lng: -83.0458, country: 'USA', city: 'Detroit' },
  'Milwaukee, USA': { lat: 43.0389, lng: -87.9065, country: 'USA', city: 'Milwaukee' },
  'Atlanta, USA': { lat: 33.7490, lng: -84.3880, country: 'USA', city: 'Atlanta' },
  'Miami, USA': { lat: 25.7617, lng: -80.1918, country: 'USA', city: 'Miami' },
  'Minneapolis, USA': { lat: 44.9778, lng: -93.2650, country: 'USA', city: 'Minneapolis' },
  'New Orleans, USA': { lat: 29.9511, lng: -90.0715, country: 'USA', city: 'New Orleans' },
  'Cleveland, USA': { lat: 41.4993, lng: -81.6944, country: 'USA', city: 'Cleveland' },
  'Pittsburgh, USA': { lat: 40.4406, lng: -79.9959, country: 'USA', city: 'Pittsburgh' },
  'Raleigh, USA': { lat: 35.7796, lng: -78.6382, country: 'USA', city: 'Raleigh' },
  'Salt Lake City, USA': { lat: 40.7608, lng: -111.8910, country: 'USA', city: 'Salt Lake City' },
  'Tampa, USA': { lat: 27.9506, lng: -82.4572, country: 'USA', city: 'Tampa' },
  
  // Canada
  'Toronto, Canada': { lat: 43.6532, lng: -79.3832, country: 'Canada', city: 'Toronto' },
  'Vancouver, Canada': { lat: 49.2827, lng: -123.1207, country: 'Canada', city: 'Vancouver' },
  'Montreal, Canada': { lat: 45.5017, lng: -73.5673, country: 'Canada', city: 'Montreal' },
  'Calgary, Canada': { lat: 51.0447, lng: -114.0719, country: 'Canada', city: 'Calgary' },
  'Ottawa, Canada': { lat: 45.4215, lng: -75.6972, country: 'Canada', city: 'Ottawa' },
  'Edmonton, Canada': { lat: 53.5461, lng: -113.4938, country: 'Canada', city: 'Edmonton' },
  'Quebec City, Canada': { lat: 46.8139, lng: -71.2080, country: 'Canada', city: 'Quebec City' },
  'Winnipeg, Canada': { lat: 49.8951, lng: -97.1384, country: 'Canada', city: 'Winnipeg' },
  
  // Mexico & Central America
  'Mexico City, Mexico': { lat: 19.4326, lng: -99.1332, country: 'Mexico', city: 'Mexico City' },
  'Guadalajara, Mexico': { lat: 20.6597, lng: -103.3496, country: 'Mexico', city: 'Guadalajara' },
  'Monterrey, Mexico': { lat: 25.6866, lng: -100.3161, country: 'Mexico', city: 'Monterrey' },
  'Cancún, Mexico': { lat: 21.1619, lng: -86.8515, country: 'Mexico', city: 'Cancún' },
  'Guatemala City, Guatemala': { lat: 14.6349, lng: -90.5069, country: 'Guatemala', city: 'Guatemala City' },
  'San José, Costa Rica': { lat: 9.9281, lng: -84.0907, country: 'Costa Rica', city: 'San José' },
  'Panama City, Panama': { lat: 8.9824, lng: -79.5199, country: 'Panama', city: 'Panama City' },
  
  // South America
  'São Paulo, Brazil': { lat: -23.5505, lng: -46.6333, country: 'Brazil', city: 'São Paulo' },
  'Rio de Janeiro, Brazil': { lat: -22.9068, lng: -43.1729, country: 'Brazil', city: 'Rio de Janeiro' },
  'Brasília, Brazil': { lat: -15.8267, lng: -47.9218, country: 'Brazil', city: 'Brasília' },
  'Salvador, Brazil': { lat: -12.9714, lng: -38.5014, country: 'Brazil', city: 'Salvador' },
  'Buenos Aires, Argentina': { lat: -34.6037, lng: -58.3816, country: 'Argentina', city: 'Buenos Aires' },
  'Córdoba, Argentina': { lat: -31.4201, lng: -64.1888, country: 'Argentina', city: 'Córdoba' },
  'Bogotá, Colombia': { lat: 4.7110, lng: -74.0721, country: 'Colombia', city: 'Bogotá' },
  'Medellín, Colombia': { lat: 6.2442, lng: -75.5812, country: 'Colombia', city: 'Medellín' },
  'Lima, Peru': { lat: -12.0464, lng: -77.0428, country: 'Peru', city: 'Lima' },
  'Santiago, Chile': { lat: -33.4489, lng: -70.6693, country: 'Chile', city: 'Santiago' },
  'Caracas, Venezuela': { lat: 10.4806, lng: -66.9036, country: 'Venezuela', city: 'Caracas' },
  'Quito, Ecuador': { lat: -0.1807, lng: -78.4678, country: 'Ecuador', city: 'Quito' },
  'La Paz, Bolivia': { lat: -16.5000, lng: -68.1500, country: 'Bolivia', city: 'La Paz' },
  'Asunción, Paraguay': { lat: -25.2637, lng: -57.5759, country: 'Paraguay', city: 'Asunción' },
  'Montevideo, Uruguay': { lat: -34.9011, lng: -56.1645, country: 'Uruguay', city: 'Montevideo' },
  
  // Germany (Significantly Expanded)
  'Berlin, Germany': { lat: 52.5200, lng: 13.4050, country: 'Germany', city: 'Berlin' },
  'Munich, Germany': { lat: 48.1351, lng: 11.5820, country: 'Germany', city: 'Munich' },
  'Hamburg, Germany': { lat: 53.5511, lng: 9.9937, country: 'Germany', city: 'Hamburg' },
  'Frankfurt, Germany': { lat: 50.1109, lng: 8.6821, country: 'Germany', city: 'Frankfurt' },
  'Cologne, Germany': { lat: 50.9375, lng: 6.9603, country: 'Germany', city: 'Cologne' },
  'Stuttgart, Germany': { lat: 48.7758, lng: 9.1829, country: 'Germany', city: 'Stuttgart' },
  'Düsseldorf, Germany': { lat: 51.2277, lng: 6.7735, country: 'Germany', city: 'Düsseldorf' },
  'Dortmund, Germany': { lat: 51.5136, lng: 7.4653, country: 'Germany', city: 'Dortmund' },
  'Essen, Germany': { lat: 51.4556, lng: 7.0116, country: 'Germany', city: 'Essen' },
  'Leipzig, Germany': { lat: 51.3397, lng: 12.3731, country: 'Germany', city: 'Leipzig' },
  'Bremen, Germany': { lat: 53.0793, lng: 8.8017, country: 'Germany', city: 'Bremen' },
  'Dresden, Germany': { lat: 51.0504, lng: 13.7373, country: 'Germany', city: 'Dresden' },
  'Hanover, Germany': { lat: 52.3759, lng: 9.7320, country: 'Germany', city: 'Hanover' },
  'Nuremberg, Germany': { lat: 49.4521, lng: 11.0767, country: 'Germany', city: 'Nuremberg' },
  'Duisburg, Germany': { lat: 51.4344, lng: 6.7623, country: 'Germany', city: 'Duisburg' },
  'Bochum, Germany': { lat: 51.4818, lng: 7.2162, country: 'Germany', city: 'Bochum' },
  'Wuppertal, Germany': { lat: 51.2562, lng: 7.1508, country: 'Germany', city: 'Wuppertal' },
  'Bielefeld, Germany': { lat: 52.0302, lng: 8.5325, country: 'Germany', city: 'Bielefeld' },
  'Bonn, Germany': { lat: 50.7374, lng: 7.0982, country: 'Germany', city: 'Bonn' },
  'Münster, Germany': { lat: 51.9607, lng: 7.6261, country: 'Germany', city: 'Münster' },
  'Mannheim, Germany': { lat: 49.4875, lng: 8.4660, country: 'Germany', city: 'Mannheim' },
  'Karlsruhe, Germany': { lat: 49.0069, lng: 8.4037, country: 'Germany', city: 'Karlsruhe' },
  'Augsburg, Germany': { lat: 48.3705, lng: 10.8978, country: 'Germany', city: 'Augsburg' },
  'Wiesbaden, Germany': { lat: 50.0826, lng: 8.2400, country: 'Germany', city: 'Wiesbaden' },
  'Mönchengladbach, Germany': { lat: 51.1805, lng: 6.4428, country: 'Germany', city: 'Mönchengladbach' },
  'Gelsenkirchen, Germany': { lat: 51.5177, lng: 7.0857, country: 'Germany', city: 'Gelsenkirchen' },
  'Aachen, Germany': { lat: 50.7753, lng: 6.0839, country: 'Germany', city: 'Aachen' },
  'Braunschweig, Germany': { lat: 52.2689, lng: 10.5268, country: 'Germany', city: 'Braunschweig' },
  'Chemnitz, Germany': { lat: 50.8278, lng: 12.9214, country: 'Germany', city: 'Chemnitz' },
  'Kiel, Germany': { lat: 54.3233, lng: 10.1228, country: 'Germany', city: 'Kiel' },
  'Freiburg, Germany': { lat: 47.9990, lng: 7.8421, country: 'Germany', city: 'Freiburg' },
  'Heidelberg, Germany': { lat: 49.3988, lng: 8.6724, country: 'Germany', city: 'Heidelberg' },
  'Potsdam, Germany': { lat: 52.3906, lng: 13.0645, country: 'Germany', city: 'Potsdam' },
  'Rostock, Germany': { lat: 54.0887, lng: 12.1401, country: 'Germany', city: 'Rostock' },
  'Lübeck, Germany': { lat: 53.8655, lng: 10.6866, country: 'Germany', city: 'Lübeck' },
  'Erfurt, Germany': { lat: 50.9848, lng: 11.0299, country: 'Germany', city: 'Erfurt' },
  
  // United Kingdom
  'London, UK': { lat: 51.5074, lng: -0.1278, country: 'UK', city: 'London' },
  'Manchester, UK': { lat: 53.4808, lng: -2.2426, country: 'UK', city: 'Manchester' },
  'Birmingham, UK': { lat: 52.4862, lng: -1.8904, country: 'UK', city: 'Birmingham' },
  'Liverpool, UK': { lat: 53.4084, lng: -2.9916, country: 'UK', city: 'Liverpool' },
  'Leeds, UK': { lat: 53.8008, lng: -1.5491, country: 'UK', city: 'Leeds' },
  'Glasgow, UK': { lat: 55.8642, lng: -4.2518, country: 'UK', city: 'Glasgow' },
  'Edinburgh, UK': { lat: 55.9533, lng: -3.1883, country: 'UK', city: 'Edinburgh' },
  'Bristol, UK': { lat: 51.4545, lng: -2.5879, country: 'UK', city: 'Bristol' },
  'Cardiff, UK': { lat: 51.4816, lng: -3.1791, country: 'UK', city: 'Cardiff' },
  'Belfast, UK': { lat: 54.5973, lng: -5.9301, country: 'UK', city: 'Belfast' },
  
  // France
  'Paris, France': { lat: 48.8566, lng: 2.3522, country: 'France', city: 'Paris' },
  'Marseille, France': { lat: 43.2965, lng: 5.3698, country: 'France', city: 'Marseille' },
  'Lyon, France': { lat: 45.7640, lng: 4.8357, country: 'France', city: 'Lyon' },
  'Toulouse, France': { lat: 43.6047, lng: 1.4442, country: 'France', city: 'Toulouse' },
  'Nice, France': { lat: 43.7102, lng: 7.2620, country: 'France', city: 'Nice' },
  'Nantes, France': { lat: 47.2184, lng: -1.5536, country: 'France', city: 'Nantes' },
  'Strasbourg, France': { lat: 48.5734, lng: 7.7521, country: 'France', city: 'Strasbourg' },
  'Bordeaux, France': { lat: 44.8378, lng: -0.5792, country: 'France', city: 'Bordeaux' },
  
  // Spain
  'Madrid, Spain': { lat: 40.4168, lng: -3.7038, country: 'Spain', city: 'Madrid' },
  'Barcelona, Spain': { lat: 41.3851, lng: 2.1734, country: 'Spain', city: 'Barcelona' },
  'Valencia, Spain': { lat: 39.4699, lng: -0.3763, country: 'Spain', city: 'Valencia' },
  'Seville, Spain': { lat: 37.3891, lng: -5.9845, country: 'Spain', city: 'Seville' },
  'Zaragoza, Spain': { lat: 41.6488, lng: -0.8891, country: 'Spain', city: 'Zaragoza' },
  'Málaga, Spain': { lat: 36.7213, lng: -4.4214, country: 'Spain', city: 'Málaga' },
  'Bilbao, Spain': { lat: 43.2630, lng: -2.9350, country: 'Spain', city: 'Bilbao' },
  
  // Italy
  'Rome, Italy': { lat: 41.9028, lng: 12.4964, country: 'Italy', city: 'Rome' },
  'Milan, Italy': { lat: 45.4642, lng: 9.1900, country: 'Italy', city: 'Milan' },
  'Naples, Italy': { lat: 40.8518, lng: 14.2681, country: 'Italy', city: 'Naples' },
  'Turin, Italy': { lat: 45.0703, lng: 7.6869, country: 'Italy', city: 'Turin' },
  'Florence, Italy': { lat: 43.7696, lng: 11.2558, country: 'Italy', city: 'Florence' },
  'Venice, Italy': { lat: 45.4408, lng: 12.3155, country: 'Italy', city: 'Venice' },
  'Bologna, Italy': { lat: 44.4949, lng: 11.3426, country: 'Italy', city: 'Bologna' },
  'Palermo, Italy': { lat: 38.1157, lng: 13.3615, country: 'Italy', city: 'Palermo' },
  
  // Netherlands
  'Amsterdam, Netherlands': { lat: 52.3676, lng: 4.9041, country: 'Netherlands', city: 'Amsterdam' },
  'Rotterdam, Netherlands': { lat: 51.9225, lng: 4.4792, country: 'Netherlands', city: 'Rotterdam' },
  'The Hague, Netherlands': { lat: 52.0705, lng: 4.3007, country: 'Netherlands', city: 'The Hague' },
  'Utrecht, Netherlands': { lat: 52.0907, lng: 5.1214, country: 'Netherlands', city: 'Utrecht' },
  
  // Other Western Europe
  'Brussels, Belgium': { lat: 50.8503, lng: 4.3517, country: 'Belgium', city: 'Brussels' },
  'Antwerp, Belgium': { lat: 51.2194, lng: 4.4025, country: 'Belgium', city: 'Antwerp' },
  'Vienna, Austria': { lat: 48.2082, lng: 16.3738, country: 'Austria', city: 'Vienna' },
  'Zurich, Switzerland': { lat: 47.3769, lng: 8.5417, country: 'Switzerland', city: 'Zurich' },
  'Geneva, Switzerland': { lat: 46.2044, lng: 6.1432, country: 'Switzerland', city: 'Geneva' },
  'Dublin, Ireland': { lat: 53.3498, lng: -6.2603, country: 'Ireland', city: 'Dublin' },
  'Cork, Ireland': { lat: 51.8985, lng: -8.4756, country: 'Ireland', city: 'Cork' },
  'Lisbon, Portugal': { lat: 38.7223, lng: -9.1393, country: 'Portugal', city: 'Lisbon' },
  'Porto, Portugal': { lat: 41.1579, lng: -8.6291, country: 'Portugal', city: 'Porto' },
  'Luxembourg City, Luxembourg': { lat: 49.6116, lng: 6.1319, country: 'Luxembourg', city: 'Luxembourg City' },
  
  // Nordic Countries
  'Stockholm, Sweden': { lat: 59.3293, lng: 18.0686, country: 'Sweden', city: 'Stockholm' },
  'Gothenburg, Sweden': { lat: 57.7089, lng: 11.9746, country: 'Sweden', city: 'Gothenburg' },
  'Malmö, Sweden': { lat: 55.6050, lng: 13.0038, country: 'Sweden', city: 'Malmö' },
  'Copenhagen, Denmark': { lat: 55.6761, lng: 12.5683, country: 'Denmark', city: 'Copenhagen' },
  'Aarhus, Denmark': { lat: 56.1629, lng: 10.2039, country: 'Denmark', city: 'Aarhus' },
  'Oslo, Norway': { lat: 59.9139, lng: 10.7522, country: 'Norway', city: 'Oslo' },
  'Bergen, Norway': { lat: 60.3913, lng: 5.3221, country: 'Norway', city: 'Bergen' },
  'Helsinki, Finland': { lat: 60.1699, lng: 24.9384, country: 'Finland', city: 'Helsinki' },
  'Reykjavik, Iceland': { lat: 64.1466, lng: -21.9426, country: 'Iceland', city: 'Reykjavik' },
  
  // Eastern Europe
  'Warsaw, Poland': { lat: 52.2297, lng: 21.0122, country: 'Poland', city: 'Warsaw' },
  'Kraków, Poland': { lat: 50.0647, lng: 19.9450, country: 'Poland', city: 'Kraków' },
  'Prague, Czech Republic': { lat: 50.0755, lng: 14.4378, country: 'Czech Republic', city: 'Prague' },
  'Budapest, Hungary': { lat: 47.4979, lng: 19.0402, country: 'Hungary', city: 'Budapest' },
  'Bucharest, Romania': { lat: 44.4268, lng: 26.1025, country: 'Romania', city: 'Bucharest' },
  'Sofia, Bulgaria': { lat: 42.6977, lng: 23.3219, country: 'Bulgaria', city: 'Sofia' },
  'Belgrade, Serbia': { lat: 44.7866, lng: 20.4489, country: 'Serbia', city: 'Belgrade' },
  'Zagreb, Croatia': { lat: 45.8150, lng: 15.9819, country: 'Croatia', city: 'Zagreb' },
  'Bratislava, Slovakia': { lat: 48.1486, lng: 17.1077, country: 'Slovakia', city: 'Bratislava' },
  'Ljubljana, Slovenia': { lat: 46.0569, lng: 14.5058, country: 'Slovenia', city: 'Ljubljana' },
  'Tallinn, Estonia': { lat: 59.4370, lng: 24.7536, country: 'Estonia', city: 'Tallinn' },
  'Riga, Latvia': { lat: 56.9496, lng: 24.1052, country: 'Latvia', city: 'Riga' },
  'Vilnius, Lithuania': { lat: 54.6872, lng: 25.2797, country: 'Lithuania', city: 'Vilnius' },
  'Kiev, Ukraine': { lat: 50.4501, lng: 30.5234, country: 'Ukraine', city: 'Kiev' },
  'Moscow, Russia': { lat: 55.7558, lng: 37.6173, country: 'Russia', city: 'Moscow' },
  'Saint Petersburg, Russia': { lat: 59.9311, lng: 30.3609, country: 'Russia', city: 'Saint Petersburg' },
  
  // Greece & Turkey
  'Athens, Greece': { lat: 37.9838, lng: 23.7275, country: 'Greece', city: 'Athens' },
  'Thessaloniki, Greece': { lat: 40.6401, lng: 22.9444, country: 'Greece', city: 'Thessaloniki' },
  'Istanbul, Turkey': { lat: 41.0082, lng: 28.9784, country: 'Turkey', city: 'Istanbul' },
  'Ankara, Turkey': { lat: 39.9334, lng: 32.8597, country: 'Turkey', city: 'Ankara' },
  'Izmir, Turkey': { lat: 38.4237, lng: 27.1428, country: 'Turkey', city: 'Izmir' },
  
  // Africa
  'Cairo, Egypt': { lat: 30.0444, lng: 31.2357, country: 'Egypt', city: 'Cairo' },
  'Alexandria, Egypt': { lat: 31.2001, lng: 29.9187, country: 'Egypt', city: 'Alexandria' },
  'Lagos, Nigeria': { lat: 6.5244, lng: 3.3792, country: 'Nigeria', city: 'Lagos' },
  'Abuja, Nigeria': { lat: 9.0765, lng: 7.3986, country: 'Nigeria', city: 'Abuja' },
  'Johannesburg, South Africa': { lat: -26.2041, lng: 28.0473, country: 'South Africa', city: 'Johannesburg' },
  'Cape Town, South Africa': { lat: -33.9249, lng: 18.4241, country: 'South Africa', city: 'Cape Town' },
  'Durban, South Africa': { lat: -29.8587, lng: 31.0218, country: 'South Africa', city: 'Durban' },
  'Nairobi, Kenya': { lat: -1.2921, lng: 36.8219, country: 'Kenya', city: 'Nairobi' },
  'Accra, Ghana': { lat: 5.6037, lng: -0.1870, country: 'Ghana', city: 'Accra' },
  'Casablanca, Morocco': { lat: 33.5731, lng: -7.5898, country: 'Morocco', city: 'Casablanca' },
  'Marrakech, Morocco': { lat: 31.6295, lng: -7.9811, country: 'Morocco', city: 'Marrakech' },
  'Addis Ababa, Ethiopia': { lat: 9.0320, lng: 38.7469, country: 'Ethiopia', city: 'Addis Ababa' },
  'Dar es Salaam, Tanzania': { lat: -6.7924, lng: 39.2083, country: 'Tanzania', city: 'Dar es Salaam' },
  'Kampala, Uganda': { lat: 0.3476, lng: 32.5825, country: 'Uganda', city: 'Kampala' },
  'Kigali, Rwanda': { lat: -1.9441, lng: 30.0619, country: 'Rwanda', city: 'Kigali' },
  'Dakar, Senegal': { lat: 14.7167, lng: -17.4677, country: 'Senegal', city: 'Dakar' },
  'Tunis, Tunisia': { lat: 36.8065, lng: 10.1815, country: 'Tunisia', city: 'Tunis' },
  'Algiers, Algeria': { lat: 36.7372, lng: 3.0869, country: 'Algeria', city: 'Algiers' },
  'Luanda, Angola': { lat: -8.8368, lng: 13.2343, country: 'Angola', city: 'Luanda' },
  'Kinshasa, DR Congo': { lat: -4.4419, lng: 15.2663, country: 'DR Congo', city: 'Kinshasa' },
  
  // Middle East
  'Dubai, UAE': { lat: 25.2048, lng: 55.2708, country: 'UAE', city: 'Dubai' },
  'Abu Dhabi, UAE': { lat: 24.4539, lng: 54.3773, country: 'UAE', city: 'Abu Dhabi' },
  'Riyadh, Saudi Arabia': { lat: 24.7136, lng: 46.6753, country: 'Saudi Arabia', city: 'Riyadh' },
  'Jeddah, Saudi Arabia': { lat: 21.5433, lng: 39.1728, country: 'Saudi Arabia', city: 'Jeddah' },
  'Tel Aviv, Israel': { lat: 32.0853, lng: 34.7818, country: 'Israel', city: 'Tel Aviv' },
  'Jerusalem, Israel': { lat: 31.7683, lng: 35.2137, country: 'Israel', city: 'Jerusalem' },
  'Beirut, Lebanon': { lat: 33.8886, lng: 35.4955, country: 'Lebanon', city: 'Beirut' },
  'Amman, Jordan': { lat: 31.9454, lng: 35.9284, country: 'Jordan', city: 'Amman' },
  'Doha, Qatar': { lat: 25.2854, lng: 51.5310, country: 'Qatar', city: 'Doha' },
  'Kuwait City, Kuwait': { lat: 29.3759, lng: 47.9774, country: 'Kuwait', city: 'Kuwait City' },
  'Muscat, Oman': { lat: 23.5880, lng: 58.3829, country: 'Oman', city: 'Muscat' },
  'Baghdad, Iraq': { lat: 33.3152, lng: 44.3661, country: 'Iraq', city: 'Baghdad' },
  'Tehran, Iran': { lat: 35.6892, lng: 51.3890, country: 'Iran', city: 'Tehran' },
  
  // Asia - East Asia
  'Tokyo, Japan': { lat: 35.6762, lng: 139.6503, country: 'Japan', city: 'Tokyo' },
  'Osaka, Japan': { lat: 34.6937, lng: 135.5023, country: 'Japan', city: 'Osaka' },
  'Kyoto, Japan': { lat: 35.0116, lng: 135.7681, country: 'Japan', city: 'Kyoto' },
  'Yokohama, Japan': { lat: 35.4437, lng: 139.6380, country: 'Japan', city: 'Yokohama' },
  'Seoul, South Korea': { lat: 37.5665, lng: 126.9780, country: 'South Korea', city: 'Seoul' },
  'Busan, South Korea': { lat: 35.1796, lng: 129.0756, country: 'South Korea', city: 'Busan' },
  'Beijing, China': { lat: 39.9042, lng: 116.4074, country: 'China', city: 'Beijing' },
  'Shanghai, China': { lat: 31.2304, lng: 121.4737, country: 'China', city: 'Shanghai' },
  'Shenzhen, China': { lat: 22.5431, lng: 114.0579, country: 'China', city: 'Shenzhen' },
  'Guangzhou, China': { lat: 23.1291, lng: 113.2644, country: 'China', city: 'Guangzhou' },
  'Chengdu, China': { lat: 30.5728, lng: 104.0668, country: 'China', city: 'Chengdu' },
  'Hong Kong': { lat: 22.3193, lng: 114.1694, country: 'Hong Kong', city: 'Hong Kong' },
  'Taipei, Taiwan': { lat: 25.0330, lng: 121.5654, country: 'Taiwan', city: 'Taipei' },
  'Ulaanbaatar, Mongolia': { lat: 47.8864, lng: 106.9057, country: 'Mongolia', city: 'Ulaanbaatar' },
  
  // Asia - South Asia
  'Mumbai, India': { lat: 19.0760, lng: 72.8777, country: 'India', city: 'Mumbai' },
  'Delhi, India': { lat: 28.7041, lng: 77.1025, country: 'India', city: 'Delhi' },
  'Bangalore, India': { lat: 12.9716, lng: 77.5946, country: 'India', city: 'Bangalore' },
  'Hyderabad, India': { lat: 17.3850, lng: 78.4867, country: 'India', city: 'Hyderabad' },
  'Chennai, India': { lat: 13.0827, lng: 80.2707, country: 'India', city: 'Chennai' },
  'Kolkata, India': { lat: 22.5726, lng: 88.3639, country: 'India', city: 'Kolkata' },
  'Pune, India': { lat: 18.5204, lng: 73.8567, country: 'India', city: 'Pune' },
  'Ahmedabad, India': { lat: 23.0225, lng: 72.5714, country: 'India', city: 'Ahmedabad' },
  'Karachi, Pakistan': { lat: 24.8607, lng: 67.0011, country: 'Pakistan', city: 'Karachi' },
  'Lahore, Pakistan': { lat: 31.5497, lng: 74.3436, country: 'Pakistan', city: 'Lahore' },
  'Islamabad, Pakistan': { lat: 33.6844, lng: 73.0479, country: 'Pakistan', city: 'Islamabad' },
  'Dhaka, Bangladesh': { lat: 23.8103, lng: 90.4125, country: 'Bangladesh', city: 'Dhaka' },
  'Colombo, Sri Lanka': { lat: 6.9271, lng: 79.8612, country: 'Sri Lanka', city: 'Colombo' },
  'Kathmandu, Nepal': { lat: 27.7172, lng: 85.3240, country: 'Nepal', city: 'Kathmandu' },
  
  // Asia - Southeast Asia
  'Bangkok, Thailand': { lat: 13.7563, lng: 100.5018, country: 'Thailand', city: 'Bangkok' },
  'Chiang Mai, Thailand': { lat: 18.7883, lng: 98.9853, country: 'Thailand', city: 'Chiang Mai' },
  'Singapore': { lat: 1.3521, lng: 103.8198, country: 'Singapore', city: 'Singapore' },
  'Kuala Lumpur, Malaysia': { lat: 3.1390, lng: 101.6869, country: 'Malaysia', city: 'Kuala Lumpur' },
  'Jakarta, Indonesia': { lat: -6.2088, lng: 106.8456, country: 'Indonesia', city: 'Jakarta' },
  'Bali, Indonesia': { lat: -8.4095, lng: 115.1889, country: 'Indonesia', city: 'Bali' },
  'Surabaya, Indonesia': { lat: -7.2575, lng: 112.7521, country: 'Indonesia', city: 'Surabaya' },
  'Manila, Philippines': { lat: 14.5995, lng: 120.9842, country: 'Philippines', city: 'Manila' },
  'Cebu, Philippines': { lat: 10.3157, lng: 123.8854, country: 'Philippines', city: 'Cebu' },
  'Hanoi, Vietnam': { lat: 21.0285, lng: 105.8542, country: 'Vietnam', city: 'Hanoi' },
  'Ho Chi Minh City, Vietnam': { lat: 10.8231, lng: 106.6297, country: 'Vietnam', city: 'Ho Chi Minh City' },
  'Phnom Penh, Cambodia': { lat: 11.5564, lng: 104.9282, country: 'Cambodia', city: 'Phnom Penh' },
  'Vientiane, Laos': { lat: 17.9757, lng: 102.6331, country: 'Laos', city: 'Vientiane' },
  'Yangon, Myanmar': { lat: 16.8661, lng: 96.1951, country: 'Myanmar', city: 'Yangon' },
  'Brunei, Brunei': { lat: 4.5353, lng: 114.7277, country: 'Brunei', city: 'Brunei' },
  
  // Oceania
  'Sydney, Australia': { lat: -33.8688, lng: 151.2093, country: 'Australia', city: 'Sydney' },
  'Melbourne, Australia': { lat: -37.8136, lng: 144.9631, country: 'Australia', city: 'Melbourne' },
  'Brisbane, Australia': { lat: -27.4698, lng: 153.0251, country: 'Australia', city: 'Brisbane' },
  'Perth, Australia': { lat: -31.9505, lng: 115.8605, country: 'Australia', city: 'Perth' },
  'Adelaide, Australia': { lat: -34.9285, lng: 138.6007, country: 'Australia', city: 'Adelaide' },
  'Gold Coast, Australia': { lat: -28.0167, lng: 153.4000, country: 'Australia', city: 'Gold Coast' },
  'Auckland, New Zealand': { lat: -36.8485, lng: 174.7633, country: 'New Zealand', city: 'Auckland' },
  'Wellington, New Zealand': { lat: -41.2865, lng: 174.7762, country: 'New Zealand', city: 'Wellington' },
  'Christchurch, New Zealand': { lat: -43.5321, lng: 172.6362, country: 'New Zealand', city: 'Christchurch' },
  'Suva, Fiji': { lat: -18.1248, lng: 178.4501, country: 'Fiji', city: 'Suva' },
  'Port Moresby, Papua New Guinea': { lat: -9.4438, lng: 147.1803, country: 'Papua New Guinea', city: 'Port Moresby' },
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
