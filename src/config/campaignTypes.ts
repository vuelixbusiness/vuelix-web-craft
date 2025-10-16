export interface CampaignType {
  id: string;
  label: string;
  icon: string;
  description: string;
  mode: 'reward_others' | 'get_rewarded';
}

export const CAMPAIGN_TYPES: CampaignType[] = [
  {
    id: 'song_content_promotion',
    label: 'Song / Content Promotion',
    icon: '🎵',
    description: 'Promote songs, albums, or content across platforms',
    mode: 'reward_others'
  },
  {
    id: 'collaboration_campaign',
    label: 'Collaboration Campaign',
    icon: '🤝',
    description: 'Partner with other creators for joint projects',
    mode: 'reward_others'
  },
  {
    id: 'visual_production',
    label: 'Visual Production',
    icon: '🎬',
    description: 'Create music videos, photography, or visual content',
    mode: 'reward_others'
  },
  {
    id: 'brand_partnership',
    label: 'Brand Partnership',
    icon: '🏢',
    description: 'Collaborate with brands for sponsored content',
    mode: 'reward_others'
  },
  {
    id: 'community_campaign',
    label: 'Community Campaign',
    icon: '👥',
    description: 'Engage fans and build community connections',
    mode: 'reward_others'
  },
  {
    id: 'performance_live_event',
    label: 'Performance / Live Event',
    icon: '🎤',
    description: 'Promote concerts, festivals, and live performances',
    mode: 'reward_others'
  },
  {
    id: 'visual_services_offering',
    label: 'Visual Services Offering',
    icon: '📸',
    description: 'Showcase your visual production services and accept bookings',
    mode: 'get_rewarded'
  }
];

export const getCampaignTypeById = (id: string): CampaignType | undefined => {
  return CAMPAIGN_TYPES.find(type => type.id === id);
};
