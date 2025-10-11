import { useState } from 'react';
import { UserRole, RoleConfig } from '@/config/roleConfig';
import YourCampaigns from '../creator-dashboard/YourCampaigns';
import ArtistYourCampaigns from '../creator-dashboard/ArtistYourCampaigns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CampaignManagerHubProps {
  role: UserRole;
  roleConfig: RoleConfig;
}

export const CampaignManagerHub = ({ role, roleConfig }: CampaignManagerHubProps) => {
  const [showJoinedCampaigns, setShowJoinedCampaigns] = useState(false);
  const { canManage } = roleConfig.campaignActions;

  return (
    <div className="space-y-6">
      {/* Toggle Header - Show for users who can manage campaigns */}
      {canManage && (
        <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
          <div className="flex flex-col">
            <Label htmlFor="campaign-view-toggle" className="text-base font-semibold">
              {showJoinedCampaigns ? 'Joined Campaigns' : 'My Campaigns'}
            </Label>
            <p className="text-sm text-muted-foreground">
              {showJoinedCampaigns 
                ? "View campaigns you've joined as a creator"
                : "View campaigns you've created"
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Label htmlFor="campaign-view-toggle" className="text-sm">
              Created
            </Label>
            <Switch
              id="campaign-view-toggle"
              checked={showJoinedCampaigns}
              onCheckedChange={setShowJoinedCampaigns}
            />
            <Label htmlFor="campaign-view-toggle" className="text-sm">
              Joined
            </Label>
          </div>
        </div>
      )}

      {/* Conditional Rendering Based on Toggle */}
      {showJoinedCampaigns ? (
        <YourCampaigns />
      ) : canManage ? (
        <ArtistYourCampaigns />
      ) : (
        <YourCampaigns />
      )}
    </div>
  );
};

export default CampaignManagerHub;
