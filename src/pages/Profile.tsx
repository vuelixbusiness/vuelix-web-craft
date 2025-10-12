import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileCampaigns } from "@/components/profile/ProfileCampaigns";
import { ProfileContentShowcase } from "@/components/profile/ProfileContentShowcase";
import { ProfilePortfolio } from "@/components/profile/ProfilePortfolio";
import { ProfileEditDialog } from "@/components/profile/ProfileEditDialog";
import { ProfileSocialStats } from "@/components/profile/ProfileSocialStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddPortfolioDialog } from "@/components/profile/AddPortfolioDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [portfolioDialogOpen, setPortfolioDialogOpen] = useState(false);
  const [isPublicVisible, setIsPublicVisible] = useState(true);
  const [portfolioKey, setPortfolioKey] = useState(0);

  const handleToggleVisibility = async () => {
    if (!user?.id) return;

    try {
      const newVisibility = !isPublicVisible;
      const { error } = await supabase
        .from('profiles')
        .update({ public_visibility: newVisibility })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsPublicVisible(newVisibility);
      toast({
        title: "Success",
        description: `Profile is now ${newVisibility ? 'public' : 'private'}`,
      });
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update visibility",
        variant: "destructive",
      });
    }
  };

  const handlePortfolioSuccess = () => {
    setPortfolioKey(prev => prev + 1);
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Profile Header with Banner */}
        <ProfileHeader 
          onEditProfile={() => setEditDialogOpen(true)}
          isPublicVisible={isPublicVisible}
          onToggleVisibility={handleToggleVisibility}
        />

        {/* Social Stats */}
        <div className="mb-8">
          <ProfileSocialStats userId={user.id} />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="shop">Shop</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content">
            <ProfileContentShowcase userId={user.id} />
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <ProfileCampaigns userId={user.id} />
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Portfolio</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPortfolioDialogOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Project
                </Button>
              </CardHeader>
              <CardContent>
                <ProfilePortfolio key={portfolioKey} userId={user.id} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shop Tab */}
          <TabsContent value="shop">
            <Card>
              <CardHeader>
                <CardTitle>Shop</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Shop section coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Events section coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Profile Dialog */}
        <ProfileEditDialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)} 
        />

        {/* Add Portfolio Dialog */}
        <AddPortfolioDialog 
          open={portfolioDialogOpen}
          onClose={() => setPortfolioDialogOpen(false)}
          onSuccess={handlePortfolioSuccess}
        />
      </div>
    </DashboardLayout>
  );
};

export default Profile;