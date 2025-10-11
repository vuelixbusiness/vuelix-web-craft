import { Music, Users, BarChart3, Settings, Disc, Palette, Building, Radio, Calendar, LucideIcon } from "lucide-react";

export type UserRole = 
  | 'artist' 
  | 'creator' 
  | 'dj'
  | 'producer'
  | 'visual_creative'
  | 'brand'
  | 'record_label'
  | 'music_group'
  | 'collective'
  | 'event_organizer';

export type DashboardModule = 
  | 'profile'
  | 'campaign_manager'
  | 'analytics_hub'
  | 'social_hub'
  | 'account_settings';

export interface ModuleVisibility {
  visible: boolean;
  features?: string[];
}

export interface RoleConfig {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  modules: {
    profile: ModuleVisibility;
    campaign_manager: ModuleVisibility;
    analytics_hub: ModuleVisibility;
    social_hub: ModuleVisibility;
    account_settings: ModuleVisibility;
  };
  campaignActions: {
    canCreate: boolean;
    canJoin: boolean;
    canManage: boolean;
  };
}

export const ROLE_CONFIGURATIONS: Record<UserRole, RoleConfig> = {
  artist: {
    name: "Artist",
    description: "Music creator and campaign manager",
    icon: Music,
    color: "text-primary",
    modules: {
      profile: {
        visible: true,
        features: ['content_showcase', 'campaigns_created', 'portfolio', 'shop', 'events']
      },
      campaign_manager: { 
        visible: true,
        features: ['create_campaign', 'manage_campaigns', 'view_submissions']
      },
      analytics_hub: { 
        visible: true,
        features: ['campaign_analytics', 'engagement_metrics', 'revenue_tracking']
      },
      social_hub: { 
        visible: true,
        features: ['creator_connections', 'collaborations', 'direct_messages']
      },
      account_settings: { visible: true }
    },
    campaignActions: {
      canCreate: true,
      canJoin: false,
      canManage: true
    }
  },
  creator: {
    name: "Creator",
    description: "Content creator and campaign participant",
    icon: Users,
    color: "text-accent",
    modules: {
      profile: {
        visible: true,
        features: ['content_showcase', 'campaigns_participated', 'portfolio']
      },
      campaign_manager: { 
        visible: true,
        features: ['browse_campaigns', 'join_campaigns', 'manage_submissions']
      },
      analytics_hub: { 
        visible: true,
        features: ['performance_tracking', 'earnings_overview', 'engagement_stats']
      },
      social_hub: { 
        visible: true,
        features: ['artist_connections', 'community', 'direct_messages']
      },
      account_settings: { visible: true }
    },
    campaignActions: {
      canCreate: false,
      canJoin: true,
      canManage: false
    }
  },
  dj: {
    name: "DJ",
    description: "Music curator and event performer",
    icon: Disc,
    color: "text-pink-500",
    modules: {
      profile: {
        visible: true,
        features: ['content_showcase', 'campaigns_created', 'campaigns_participated', 'portfolio', 'events']
      },
      campaign_manager: { 
        visible: true,
        features: ['browse_campaigns', 'create_campaign', 'join_campaigns']
      },
      analytics_hub: { 
        visible: true,
        features: ['performance_tracking', 'audience_metrics', 'set_analytics']
      },
      social_hub: { 
        visible: true,
        features: ['artist_network', 'venue_connections', 'collaborations']
      },
      account_settings: { visible: true }
    },
    campaignActions: {
      canCreate: true,
      canJoin: true,
      canManage: true
    }
  },
  producer: {
    name: "Producer",
    description: "Music production and beat creation",
    icon: Radio,
    color: "text-green-500",
    modules: {
      profile: {
        visible: true,
        features: ['content_showcase', 'campaigns_created', 'campaigns_participated', 'portfolio', 'shop']
      },
      campaign_manager: { 
        visible: true,
        features: ['browse_campaigns', 'create_campaign', 'licensing']
      },
      analytics_hub: { 
        visible: true,
        features: ['track_performance', 'licensing_revenue', 'collaboration_metrics']
      },
      social_hub: { 
        visible: true,
        features: ['artist_collaborations', 'producer_network', 'marketplace']
      },
      account_settings: { visible: true }
    },
    campaignActions: {
      canCreate: true,
      canJoin: true,
      canManage: true
    }
  },
  visual_creative: {
    name: "Visual Creative",
    description: "Visual content and design specialist",
    icon: Palette,
    color: "text-orange-500",
    modules: {
      profile: {
        visible: true,
        features: ['content_showcase', 'campaigns_participated', 'portfolio']
      },
      campaign_manager: { 
        visible: true,
        features: ['browse_campaigns', 'join_campaigns', 'portfolio_showcase']
      },
      analytics_hub: { 
        visible: true,
        features: ['content_performance', 'engagement_tracking', 'portfolio_analytics']
      },
      social_hub: { 
        visible: true,
        features: ['creative_network', 'collaborations', 'client_connections']
      },
      account_settings: { visible: true }
    },
    campaignActions: {
      canCreate: false,
      canJoin: true,
      canManage: false
    }
  },
  brand: {
    name: "Brand",
    description: "Brand marketing and partnerships",
    icon: Building,
    color: "text-cyan-500",
    modules: {
      profile: {
        visible: true,
        features: ['content_showcase', 'campaigns_created', 'shop']
      },
      campaign_manager: { 
        visible: true,
        features: ['create_campaign', 'manage_campaigns', 'partnership_management']
      },
      analytics_hub: { 
        visible: true,
        features: ['campaign_roi', 'brand_metrics', 'audience_insights']
      },
      social_hub: { 
        visible: true,
        features: ['influencer_network', 'partnerships', 'collaborations']
      },
      account_settings: { visible: true }
    },
    campaignActions: {
      canCreate: true,
      canJoin: false,
      canManage: true
    }
  },
  record_label: {
    name: "Record Label",
    description: "Label management and artist development",
    icon: Music,
    color: "text-red-500",
    modules: {
      profile: {
        visible: true,
        features: ['content_showcase', 'campaigns_created', 'portfolio', 'shop']
      },
      campaign_manager: { 
        visible: true,
        features: ['create_campaign', 'manage_campaigns', 'artist_roster']
      },
      analytics_hub: { 
        visible: true,
        features: ['label_analytics', 'artist_performance', 'revenue_tracking']
      },
      social_hub: { 
        visible: true,
        features: ['artist_network', 'industry_connections', 'a&r']
      },
      account_settings: { visible: true }
    },
    campaignActions: {
      canCreate: true,
      canJoin: false,
      canManage: true
    }
  },
  music_group: {
    name: "Music Group",
    description: "Band or collaborative music entity",
    icon: Users,
    color: "text-indigo-500",
    modules: {
      profile: {
        visible: true,
        features: ['content_showcase', 'campaigns_created', 'campaigns_participated', 'portfolio', 'events']
      },
      campaign_manager: { 
        visible: true,
        features: ['create_campaign', 'manage_campaigns', 'group_coordination']
      },
      analytics_hub: { 
        visible: true,
        features: ['group_performance', 'member_contributions', 'revenue_split']
      },
      social_hub: { 
        visible: true,
        features: ['fan_engagement', 'collaborations', 'member_communication']
      },
      account_settings: { visible: true }
    },
    campaignActions: {
      canCreate: true,
      canJoin: true,
      canManage: true
    }
  },
  collective: {
    name: "Collective",
    description: "Creative collective and community",
    icon: Users,
    color: "text-yellow-500",
    modules: {
      profile: {
        visible: true,
        features: ['content_showcase', 'campaigns_created', 'campaigns_participated', 'portfolio', 'events']
      },
      campaign_manager: { 
        visible: true,
        features: ['create_campaign', 'join_campaigns', 'member_management']
      },
      analytics_hub: { 
        visible: true,
        features: ['collective_metrics', 'member_performance', 'community_growth']
      },
      social_hub: { 
        visible: true,
        features: ['member_network', 'community_building', 'collaborations']
      },
      account_settings: { visible: true }
    },
    campaignActions: {
      canCreate: true,
      canJoin: true,
      canManage: true
    }
  },
  event_organizer: {
    name: "Event Organizer",
    description: "Event planning and promotion",
    icon: Calendar,
    color: "text-teal-500",
    modules: {
      profile: {
        visible: true,
        features: ['content_showcase', 'campaigns_created', 'events']
      },
      campaign_manager: { 
        visible: true,
        features: ['create_campaign', 'event_promotion', 'ticket_integration']
      },
      analytics_hub: { 
        visible: true,
        features: ['event_metrics', 'attendance_tracking', 'promotion_performance']
      },
      social_hub: { 
        visible: true,
        features: ['artist_booking', 'venue_network', 'attendee_engagement']
      },
      account_settings: { visible: true }
    },
    campaignActions: {
      canCreate: true,
      canJoin: false,
      canManage: true
    }
  }
};

export const getRoleConfig = (role: UserRole): RoleConfig => {
  return ROLE_CONFIGURATIONS[role];
};

export const canAccessModule = (role: UserRole, module: DashboardModule): boolean => {
  return ROLE_CONFIGURATIONS[role].modules[module].visible;
};

export const getModuleFeatures = (role: UserRole, module: DashboardModule): string[] => {
  return ROLE_CONFIGURATIONS[role].modules[module].features || [];
};
