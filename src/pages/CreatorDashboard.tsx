import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";
import CampaignManagement from "@/components/creator-dashboard/CampaignManagement";
import AnalyticsHub from "@/components/creator-dashboard/AnalyticsHub";
import ArtistRelations from "@/components/creator-dashboard/ArtistRelations";
import AccountSettings from "@/components/creator-dashboard/AccountSettings";
import { 
  Music, 
  BarChart3, 
  Users, 
  Settings
} from "lucide-react";

const CreatorDashboard = () => {
  const [activeTab, setActiveTab] = useState('management');

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your campaigns, track performance, and grow your creator network
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="management" className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              <span className="hidden sm:inline">Campaign Manager</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics Hub</span>
            </TabsTrigger>
            <TabsTrigger value="creators" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Social Hub</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Account Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="management" className="space-y-6">
            <CampaignManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsHub />
          </TabsContent>

          <TabsContent value="creators" className="space-y-6">
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