export interface CampaignType {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export const CAMPAIGN_TYPES: CampaignType[] = [
  {
    id: 'song_content_promotion',
    label: 'Song / Content Promotion',
    icon: '🎵',
    description: 'Promote songs, albums, or content across platforms'
  },
  {
    id: 'collaboration_campaign',
    label: 'Collaboration Campaign',
    icon: '🤝',
    description: 'Partner with other creators for joint projects'
  },
  {
    id: 'visual_production',
    label: 'Visual Production',
    icon: '🎬',
    description: 'Create music videos, photography, or visual content'
  },
  {
    id: 'brand_partnership',
    label: 'Brand Partnership',
    icon: '🏢',
    description: 'Collaborate with brands for sponsored content'
  },
  {
    id: 'community_campaign',
    label: 'Community Campaign',
    icon: '👥',
    description: 'Engage fans and build community connections'
  },
  {
    id: 'performance_live_event',
    label: 'Performance / Live Event',
    icon: '🎤',
    description: 'Promote concerts, festivals, and live performances'
  }
];

export const getCampaignTypeById = (id: string): CampaignType | undefined => {
  return CAMPAIGN_TYPES.find(type => type.id === id);
};
