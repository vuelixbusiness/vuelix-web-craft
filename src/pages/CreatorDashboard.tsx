import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import CampaignManagement from "@/components/creator-dashboard/CampaignManagement";
import AnalyticsHub from "@/components/creator-dashboard/AnalyticsHub";
import ArtistRelations from "@/components/creator-dashboard/ArtistRelations";
import AccountSettings from "@/components/creator-dashboard/AccountSettings";
import YourCampaigns from "@/components/creator-dashboard/YourCampaigns";
import { 
  Target, 
  BarChart3, 
  Users, 
  Settings,
  PlayCircle 
} from "lucide-react";

const CreatorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('campaigns');

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.email?.split('@')[0]}! 👋</h1>
          <p className="text-muted-foreground">
            Manage your campaigns, track performance, and grow your creator network
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Your Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Campaign Mgmt</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics Hub</span>
            </TabsTrigger>
            <TabsTrigger value="artists" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Artist Relations</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Account Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            <YourCampaigns />
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <CampaignManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsHub />
          </TabsContent>

          <TabsContent value="artists" className="space-y-6">
            <ArtistRelations />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <AccountSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CreatorDashboard;