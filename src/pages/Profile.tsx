import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileCampaigns } from "@/components/profile/ProfileCampaigns";
import { ProfileContentShowcase } from "@/components/profile/ProfileContentShowcase";
import { ProfileEditDialog } from "@/components/profile/ProfileEditDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isPublicVisible, setIsPublicVisible] = useState(true);

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
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Portfolio section coming soon
                </p>
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
      </div>
    </DashboardLayout>
  );
};

export default Profile;