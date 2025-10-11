import { UserRole, RoleConfig } from '@/config/roleConfig';
import YourCampaigns from '../creator-dashboard/YourCampaigns';
import CampaignManagement from '../creator-dashboard/CampaignManagement';

interface CampaignManagerHubProps {
  role: UserRole;
  roleConfig: RoleConfig;
}

export const CampaignManagerHub = ({ role, roleConfig }: CampaignManagerHubProps) => {
  const features = roleConfig.modules.campaign_manager.features || [];
  const { canCreate, canJoin, canManage } = roleConfig.campaignActions;

  // Artists and similar roles see campaign management
  if (canManage && features.includes('manage_campaigns')) {
    return <CampaignManagement />;
  }

  // Creators and similar roles see campaign browsing
  if (canJoin && features.includes('browse_campaigns')) {
    return <YourCampaigns />;
  }

  return <YourCampaigns />;
};

export default CampaignManagerHub;
