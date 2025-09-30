import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileSocialStats } from "@/components/profile/ProfileSocialStats";
import { ProfileAchievements } from "@/components/profile/ProfileAchievements";
import { ProfileCampaigns } from "@/components/profile/ProfileCampaigns";
import { ProfileContentShowcase } from "@/components/profile/ProfileContentShowcase";
import { ProfileSkills } from "@/components/profile/ProfileSkills";
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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <ProfileSocialStats userId={user.id} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProfileAchievements userId={user.id} featured />
              <ProfileCampaigns userId={user.id} limit={3} />
            </div>

            <ProfileContentShowcase userId={user.id} featured />
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <ProfileCampaigns userId={user.id} />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <ProfileAchievements userId={user.id} />
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <ProfileContentShowcase userId={user.id} />
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileSkills userId={user.id} />
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