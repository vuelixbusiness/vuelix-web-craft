// Color mapping for user types on the globe
export const USER_TYPE_COLORS: Record<string, string> = {
  artist: '#0047AB',           // Artists - Royal Blue
  creator: '#FF3B30',          // Content Creators - Red
  producer: '#4DA6FF',         // Producers - Light Blue
  dj: '#20C997',               // DJs - Teal
  visual_creative: '#C8A2C8',  // Visual Creatives - Lilac
  collective: '#8B6914',       // Collectives - Dark Goldenrod
  record_label: '#ADFF2F',     // Record Labels - Green Yellow
  brand: '#FFD700',            // Brands - Gold
  studio: '#800000',           // Studios - Maroon
  festival_event: '#FF69B4',   // Festivals & Events - Hot Pink
  default: '#8A2BE2'           // Default - Blue Violet
};

export function getUserTypeColor(userType: string): string {
  return USER_TYPE_COLORS[userType] || USER_TYPE_COLORS.default;
}

export function getUserTypeIcon(userType: string): string {
  const icons: Record<string, string> = {
    artist: '🎵',
    creator: '🎥',
    visual_creative: '🖼️',
    dj: '🎧',
    producer: '🎹',
    collective: '👥',
    record_label: '💿',
    brand: '🏷️',
    studio: '🎛️',
    festival_event: '🎤',
  };
  return icons[userType] || '👤';
}
