export interface CampaignFormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'date';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export interface CampaignFormConfig {
  icon: string;
  goal: string;
  bestFor: string[];
  step1: {
    title: string;
    description: string;
    assetUploadLabel: string;
    assetUploadDescription: string;
    acceptedFileTypes: string;
    assetTitleLabel: string;
    assetTitlePlaceholder: string;
    coverArtLabel: string;
    coverArtDescription: string;
    genreLabel: string;
    genres: string[];
    platforms: string[];
    platformsLabel: string;
  };
  step2: {
    title: string;
    description: string;
    instructionsLabel: string;
    instructionsPlaceholder: string;
    rulesLabel: string;
    rulesPlaceholder: string;
    referenceLinksLabel: string;
    referenceLinksPlaceholder: string;
    additionalFields?: CampaignFormField[];
  };
  step3: {
    budgetLabel: string;
    budgetDescription: string;
    endDateLabel: string;
    endDateDescription: string;
  };
}

export const CAMPAIGN_FORM_CONFIGS: Record<string, CampaignFormConfig> = {
  song_content_promotion: {
    icon: '🎵',
    goal: 'reach, engagement, conversions (Spotify plays, YouTube views, etc.)',
    bestFor: ['Artists', 'Creators', 'DJs', 'Collectives'],
    step1: {
      title: 'Choose Your Song',
      description: 'Upload your track and set the campaign parameters',
      assetUploadLabel: 'Upload Song',
      assetUploadDescription: 'Upload your music file or paste a SoundCloud/Spotify link',
      acceptedFileTypes: 'audio/*',
      assetTitleLabel: 'Song Title',
      assetTitlePlaceholder: 'Enter your song title',
      coverArtLabel: 'Album Artwork / Cover Art',
      coverArtDescription: 'Upload cover art or paste an image link',
      genreLabel: 'Music Genre',
      genres: ['Hip Hop', 'Pop', 'R&B', 'Rock', 'Electronic', 'Country', 'Jazz', 'Reggae', 'Latin', 'Indie', 'Folk', 'Classical', 'Custom'],
      platforms: ['tiktok', 'instagram', 'youtube'],
      platformsLabel: 'Target Platforms'
    },
    step2: {
      title: 'Set Rewards',
      description: 'Define how creators will be rewarded for promoting your song',
      instructionsLabel: 'Creator Instructions',
      instructionsPlaceholder: 'How should creators promote your song? (e.g., Use the song in dance videos, lip-sync content, etc.)',
      rulesLabel: 'Campaign Rules',
      rulesPlaceholder: 'Additional rules and requirements',
      referenceLinksLabel: 'Reference Links',
      referenceLinksPlaceholder: 'Example videos or inspiration (one per line)'
    },
    step3: {
      budgetLabel: 'Campaign Budget',
      budgetDescription: 'Total budget for creator rewards',
      endDateLabel: 'Campaign Duration',
      endDateDescription: 'When should this campaign end?'
    }
  },

  collaboration_campaign: {
    icon: '🤝',
    goal: 'connect, co-create, and share royalties or visibility',
    bestFor: ['Artists', 'Producers', 'Visual Creatives', 'Collectives'],
    step1: {
      title: 'Define Your Project',
      description: 'Share your project vision and collaboration needs',
      assetUploadLabel: 'Upload Reference Materials',
      assetUploadDescription: 'Upload reference audio/visuals (optional)',
      acceptedFileTypes: 'audio/*,video/*,image/*',
      assetTitleLabel: 'Project Title',
      assetTitlePlaceholder: 'Name your collaboration project',
      coverArtLabel: 'Project Image',
      coverArtDescription: 'Upload a visual representation of your project',
      genreLabel: 'Collaboration Type',
      genres: ['Beat Making', 'Songwriting', 'Remix', 'Feature', 'Production', 'Co-Writing', 'Live Performance', 'Custom'],
      platforms: ['tiktok', 'instagram', 'youtube', 'soundcloud', 'spotify'],
      platformsLabel: 'Distribution Platforms'
    },
    step2: {
      title: 'Collaboration Terms',
      description: 'Define collaboration guidelines and expectations',
      instructionsLabel: 'Collaboration Guidelines',
      instructionsPlaceholder: 'What are you looking for in a collaborator? What skills or style should they have?',
      rulesLabel: 'Collaboration Terms',
      rulesPlaceholder: 'Define ownership, revenue splits, deadlines, and other terms',
      referenceLinksLabel: 'Mood Boards / Examples',
      referenceLinksPlaceholder: 'Share inspiration or similar collaborations',
      additionalFields: [
        {
          id: 'revenue_split',
          label: 'Revenue Split %',
          type: 'number',
          placeholder: 'e.g., 50/50 split',
          required: false
        },
        {
          id: 'deliverable_timeline',
          label: 'Deliverable Timeline',
          type: 'text',
          placeholder: 'When do you need the final deliverable?',
          required: false
        }
      ]
    },
    step3: {
      budgetLabel: 'Collaboration Budget',
      budgetDescription: 'Budget for collaboration fees (if applicable)',
      endDateLabel: 'Project Deadline',
      endDateDescription: 'When should this collaboration be completed?'
    }
  },

  visual_production: {
    icon: '🎬',
    goal: 'connect artists with visual creatives or studios',
    bestFor: ['Artists', 'Producers', 'Visual Creatives', 'Studios'],
    step1: {
      title: 'Define Production Needs',
      description: 'Share your production brief and creative vision',
      assetUploadLabel: 'Upload Brief / References',
      assetUploadDescription: 'Upload mood boards, reference images, or example videos',
      acceptedFileTypes: 'image/*,video/*,.pdf',
      assetTitleLabel: 'Production Title',
      assetTitlePlaceholder: 'Name your visual production',
      coverArtLabel: 'Reference Image',
      coverArtDescription: 'Upload a key visual or reference image',
      genreLabel: 'Production Type',
      genres: ['Music Video', 'Photography', 'Album Art', 'Short Film', 'Documentary', 'Animation', 'Lyric Video', 'Live Recording', 'Custom'],
      platforms: ['youtube', 'instagram', 'vimeo', 'tiktok'],
      platformsLabel: 'Distribution Platforms'
    },
    step2: {
      title: 'Production Brief',
      description: 'Define creative direction and technical requirements',
      instructionsLabel: 'Creative Direction',
      instructionsPlaceholder: 'Describe your creative vision, style, mood, and key elements you want to capture',
      rulesLabel: 'Technical Requirements',
      rulesPlaceholder: 'Format requirements, resolution, deliverables, etc.',
      referenceLinksLabel: 'Visual References',
      referenceLinksPlaceholder: 'Share examples of videos/photos that inspire this project',
      additionalFields: [
        {
          id: 'deliverable_format',
          label: 'Deliverable Format',
          type: 'select',
          options: ['4K Video', '1080p Video', 'RAW Photos', 'Edited Photos', 'Graphics Package', 'Custom'],
          required: false
        },
        {
          id: 'revision_rounds',
          label: 'Revision Rounds Included',
          type: 'number',
          placeholder: 'Number of revision rounds',
          required: false
        }
      ]
    },
    step3: {
      budgetLabel: 'Production Budget',
      budgetDescription: 'Total budget for production costs',
      endDateLabel: 'Production Deadline',
      endDateDescription: 'When do you need the final deliverable?'
    }
  },

  brand_partnership: {
    icon: '🏢',
    goal: 'merge artist/creator influence with brand exposure',
    bestFor: ['Brands', 'Artists', 'Creators', 'Festivals'],
    step1: {
      title: 'Define Partnership',
      description: 'Share brand details and partnership objectives',
      assetUploadLabel: 'Upload Brand Assets',
      assetUploadDescription: 'Upload logos, product images, brand guidelines',
      acceptedFileTypes: 'image/*,video/*,.pdf',
      assetTitleLabel: 'Campaign Title',
      assetTitlePlaceholder: 'Name your brand partnership campaign',
      coverArtLabel: 'Brand Logo / Campaign Image',
      coverArtDescription: 'Upload your brand logo or campaign visual',
      genreLabel: 'Partnership Type',
      genres: ['Sponsored Content', 'Product Placement', 'Brand Ambassador', 'Event Sponsorship', 'Influencer Marketing', 'Co-Branded Content', 'Custom'],
      platforms: ['tiktok', 'instagram', 'youtube', 'linkedin', 'twitter'],
      platformsLabel: 'Target Platforms'
    },
    step2: {
      title: 'Partnership Guidelines',
      description: 'Define brand requirements and messaging guidelines',
      instructionsLabel: 'Brand Requirements',
      instructionsPlaceholder: 'What are the key messages, brand values, and content requirements?',
      rulesLabel: 'Partnership Terms',
      rulesPlaceholder: 'Disclosure requirements, exclusivity terms, content approval process, etc.',
      referenceLinksLabel: 'Brand Examples',
      referenceLinksPlaceholder: 'Share successful brand campaigns or reference content',
      additionalFields: [
        {
          id: 'hashtag_requirements',
          label: 'Required Hashtags',
          type: 'text',
          placeholder: '#BrandName #CampaignName',
          required: false
        },
        {
          id: 'ftc_disclosure',
          label: 'FTC Disclosure Required',
          type: 'select',
          options: ['Yes', 'No'],
          required: true
        },
        {
          id: 'exclusivity_period',
          label: 'Exclusivity Period',
          type: 'text',
          placeholder: 'e.g., 30 days',
          required: false
        }
      ]
    },
    step3: {
      budgetLabel: 'Sponsorship Budget',
      budgetDescription: 'Total budget for partnership activations',
      endDateLabel: 'Partnership Duration',
      endDateDescription: 'When should this partnership end?'
    }
  },

  community_campaign: {
    icon: '👥',
    goal: 'engagement, social impact, and community-driven growth',
    bestFor: ['Collectives', 'Community Leaders', 'Creators', 'Brands'],
    step1: {
      title: 'Define Community Goal',
      description: 'Share your campaign vision and community impact goals',
      assetUploadLabel: 'Upload Campaign Media',
      assetUploadDescription: 'Upload campaign images, videos, or infographics',
      acceptedFileTypes: 'image/*,video/*',
      assetTitleLabel: 'Campaign Title',
      assetTitlePlaceholder: 'Name your community campaign',
      coverArtLabel: 'Campaign Image',
      coverArtDescription: 'Upload a visual that represents your campaign',
      genreLabel: 'Campaign Type',
      genres: ['Social Cause', 'Challenge', 'Awareness', 'Fundraising', 'Community Building', 'Education', 'Activism', 'Custom'],
      platforms: ['tiktok', 'instagram', 'youtube', 'twitter', 'facebook'],
      platformsLabel: 'Community Platforms'
    },
    step2: {
      title: 'Campaign Guidelines',
      description: 'Define campaign goals and community impact metrics',
      instructionsLabel: 'Campaign Instructions',
      instructionsPlaceholder: 'How should community members participate? What actions should they take?',
      rulesLabel: 'Participation Guidelines',
      rulesPlaceholder: 'Community guidelines, content requirements, and participation rules',
      referenceLinksLabel: 'Inspiration / Examples',
      referenceLinksPlaceholder: 'Share similar campaigns or movement examples',
      additionalFields: [
        {
          id: 'campaign_hashtags',
          label: 'Campaign Hashtags',
          type: 'text',
          placeholder: '#CampaignName #CommunityGoal',
          required: false
        },
        {
          id: 'social_impact_goal',
          label: 'Social Impact Goal',
          type: 'textarea',
          placeholder: 'What impact do you want to create?',
          required: false
        },
        {
          id: 'charity_info',
          label: 'Charity/Cause Details',
          type: 'textarea',
          placeholder: 'If applicable, share charity or cause information',
          required: false
        }
      ]
    },
    step3: {
      budgetLabel: 'Campaign Budget',
      budgetDescription: 'Budget for incentives and campaign activation',
      endDateLabel: 'Campaign End Date',
      endDateDescription: 'When should this community campaign end?'
    }
  },

  performance_live_event: {
    icon: '🎤',
    goal: 'ticket sales, attendance, live content reach',
    bestFor: ['Artists', 'DJs', 'Festivals', 'Studios'],
    step1: {
      title: 'Define Your Event',
      description: 'Share event details and promotion needs',
      assetUploadLabel: 'Upload Event Assets',
      assetUploadDescription: 'Upload event flyers, promo videos, or lineup graphics',
      acceptedFileTypes: 'image/*,video/*',
      assetTitleLabel: 'Event Name',
      assetTitlePlaceholder: 'Name of your event',
      coverArtLabel: 'Event Poster / Flyer',
      coverArtDescription: 'Upload your event poster or promotional flyer',
      genreLabel: 'Event Type',
      genres: ['Concert', 'Festival', 'DJ Set', 'Virtual Event', 'Album Release', 'Tour', 'Club Night', 'Pop-Up Show', 'Custom'],
      platforms: ['tiktok', 'instagram', 'youtube', 'facebook', 'eventbrite'],
      platformsLabel: 'Promotion Platforms'
    },
    step2: {
      title: 'Promotion Requirements',
      description: 'Define how creators should promote your event',
      instructionsLabel: 'Promotion Guidelines',
      instructionsPlaceholder: 'How should creators promote your event? What content should they create?',
      rulesLabel: 'Event Details & Rules',
      rulesPlaceholder: 'Date, time, location, ticket info, age restrictions, etc.',
      referenceLinksLabel: 'Event Links',
      referenceLinksPlaceholder: 'Ticket links, venue website, event page, etc.',
      additionalFields: [
        {
          id: 'event_date',
          label: 'Event Date',
          type: 'date',
          required: true
        },
        {
          id: 'event_location',
          label: 'Event Location',
          type: 'text',
          placeholder: 'Venue name and address',
          required: true
        },
        {
          id: 'ticket_link',
          label: 'Ticket Link',
          type: 'text',
          placeholder: 'https://tickets.example.com',
          required: false
        },
        {
          id: 'promo_code',
          label: 'Creator Promo Code',
          type: 'text',
          placeholder: 'Special promo code for creators to share',
          required: false
        }
      ]
    },
    step3: {
      budgetLabel: 'Promotion Budget',
      budgetDescription: 'Budget for creator promotions and incentives',
      endDateLabel: 'Promotion End Date',
      endDateDescription: 'When should promotion end? (typically event date)'
    }
  },

  visual_services_offering: {
    icon: '📸',
    goal: 'showcase services, attract clients, accept bookings',
    bestFor: ['Visual Creatives', 'Photographers', 'Videographers', 'Studios', 'Editors'],
    step1: {
      title: 'Showcase Your Services',
      description: 'Display your expertise, equipment, and portfolio',
      assetUploadLabel: 'Upload Portfolio Samples',
      assetUploadDescription: 'Upload your best work samples (videos, photos, reels)',
      acceptedFileTypes: 'image/*,video/*',
      assetTitleLabel: 'Service Title',
      assetTitlePlaceholder: 'e.g., Professional Music Video Production',
      coverArtLabel: 'Featured Work',
      coverArtDescription: 'Upload your signature piece or best work sample',
      genreLabel: 'Service Type',
      genres: [
        'Music Video Production',
        'Photography (Portrait/Lifestyle)',
        'Album Cover Art',
        'Short Film Production',
        'Documentary Filming',
        'Animation & Motion Graphics',
        'Lyric Video Creation',
        'Live Event Recording',
        'Video Editing Services',
        'Color Grading',
        'Custom'
      ],
      platforms: ['youtube', 'instagram', 'vimeo', 'behance', 'website'],
      platformsLabel: 'Portfolio Platforms (where clients can see your work)'
    },
    step2: {
      title: 'Service Details & Terms',
      description: 'Define what you offer and your booking requirements',
      instructionsLabel: 'Service Description',
      instructionsPlaceholder: 'Describe your services in detail. Include:\n• Your creative style and approach\n• Equipment you use (cameras, lenses, software)\n• Your experience and notable clients\n• What makes your service unique\n• Typical turnaround time',
      rulesLabel: 'Booking Requirements & Terms',
      rulesPlaceholder: 'Define your service terms:\n• Advance booking time required\n• Deposit requirements\n• Revision policy\n• Travel availability\n• File delivery formats\n• Usage rights and licensing',
      referenceLinksLabel: 'Portfolio Links',
      referenceLinksPlaceholder: 'Link to your full portfolio, showreel, or website:\n• YouTube channel\n• Instagram portfolio\n• Vimeo showcase\n• Personal website',
      additionalFields: [
        {
          id: 'equipment_list',
          label: 'Equipment & Tools',
          type: 'textarea',
          placeholder: 'List your professional equipment:\n• Cameras (e.g., Sony A7S III, Canon R5)\n• Lenses\n• Software (Adobe Premiere, DaVinci Resolve, etc.)\n• Additional gear (drones, gimbals, lighting)',
          required: false
        },
        {
          id: 'deliverables',
          label: 'What\'s Included',
          type: 'textarea',
          placeholder: 'What do clients receive?\n• Number of edited videos/photos\n• RAW files included?\n• How many revision rounds?\n• Color grading?\n• Music licensing assistance?',
          required: true
        },
        {
          id: 'turnaround_time',
          label: 'Typical Turnaround Time',
          type: 'text',
          placeholder: 'e.g., 2-3 weeks after shoot',
          required: true
        },
        {
          id: 'travel_availability',
          label: 'Travel Availability',
          type: 'select',
          options: ['Local only', 'Regional (within state)', 'National', 'International', 'Remote work only'],
          required: false
        }
      ]
    },
    step3: {
      budgetLabel: 'Starting Rate',
      budgetDescription: 'What is your starting rate for this service? (This will be visible to potential clients)',
      endDateLabel: 'Availability Period',
      endDateDescription: 'How long is this service offering active? (Optional - leave blank for always available)'
    }
  }
};

export const getCampaignFormConfig = (campaignType: string): CampaignFormConfig | null => {
  return CAMPAIGN_FORM_CONFIGS[campaignType] || null;
};
