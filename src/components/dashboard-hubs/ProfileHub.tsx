import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole, RoleConfig } from '@/config/roleConfig';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileCampaigns } from '@/components/profile/ProfileCampaigns';
import { ProfilePortfolio } from '@/components/profile/ProfilePortfolio';
import { AddEventDialog } from '@/components/profile/AddEventDialog';
import { Briefcase, ShoppingBag, Calendar, Plus } from 'lucide-react';

interface ProfileHubProps {
  role: UserRole;
  roleConfig: RoleConfig;
}

export const ProfileHub = ({ role, roleConfig }: ProfileHubProps) => {
  const { user } = useAuth();
  const features = roleConfig.modules.profile.features || [];
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false);

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Please log in to view your profile</p>
        </CardContent>
      </Card>
    );
  }

  const showCampaigns = features.includes('campaigns_created') || features.includes('campaigns_participated');
  const showPortfolio = features.includes('portfolio');
  const showShop = features.includes('shop');
  const showEvents = features.includes('events');

  const defaultTab = showCampaigns ? 'campaigns' : showPortfolio ? 'portfolio' : showShop ? 'shop' : 'events';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Profile</h2>
        <p className="text-muted-foreground">Manage your public profile and content</p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          {showCampaigns && (
            <TabsTrigger value="campaigns" className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Campaigns</span>
            </TabsTrigger>
          )}
          {showPortfolio && (
            <TabsTrigger value="portfolio" className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
          )}
          {showShop && (
            <TabsTrigger value="shop" className="flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Shop</span>
            </TabsTrigger>
          )}
          {showEvents && (
            <TabsTrigger value="events" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
          )}
        </TabsList>

        {showCampaigns && (
          <TabsContent value="campaigns" className="space-y-4">
            <ProfileCampaigns userId={user.id} />
          </TabsContent>
        )}

        {showPortfolio && (
          <TabsContent value="portfolio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
                <CardDescription>Showcase your best work</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfilePortfolio userId={user.id} isOwnProfile={true} />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {showShop && (
          <TabsContent value="shop" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Shop</CardTitle>
                <CardDescription>Your products and merchandise</CardDescription>
              </CardHeader>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Shop functionality coming soon</p>
                  <p className="text-sm mt-2">Set up your store to sell products and merchandise</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {showEvents && (
          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1.5">
                  <CardTitle>Events</CardTitle>
                  <CardDescription>Your upcoming and past events</CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAddEventDialogOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Event</span>
                </Button>
              </CardHeader>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Events functionality coming soon</p>
                  <p className="text-sm mt-2">Manage your live performances and appearances</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <AddEventDialog 
        open={addEventDialogOpen}
        onClose={() => setAddEventDialogOpen(false)}
      />
    </div>
  );
};

export default ProfileHub;
