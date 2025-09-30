import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";
import CampaignManagement from "@/components/creator-dashboard/CampaignManagement";
import AnalyticsHub from "@/components/creator-dashboard/AnalyticsHub";
import ArtistRelations from "@/components/creator-dashboard/ArtistRelations";
import AccountSettings from "@/components/creator-dashboard/AccountSettings";
import { useNavigate } from "react-router-dom";
import { 
  Music, 
  BarChart3, 
  Users, 
  Settings,
  Search
} from "lucide-react";

type DashboardProfile = 'management' | 'analytics' | 'creators' | 'settings';

const profileConfigs = {
  management: {
    title: "Campaign Manager",
    description: "Discover and join music campaigns",
    icon: Music,
    color: "text-blue-500",
    component: CampaignManagement
  },
  analytics: {
    title: "Analytics Hub",
    description: "Track your performance and earnings",
    icon: BarChart3,
    color: "text-green-500",
    component: AnalyticsHub
  },
  creators: {
    title: "Social Hub",
    description: "Connect with artists and fellow creators",
    icon: Users,
    color: "text-purple-500",
    component: ArtistRelations
  },
  settings: {
    title: "Account Settings",
    description: "Manage your creator profile",
    icon: Settings,
    color: "text-gray-500",
    component: AccountSettings
  }
};

const CreatorDashboard = () => {
  const navigate = useNavigate();
  const [activeProfile, setActiveProfile] = useState<DashboardProfile>('management');

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Profile Switcher Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
              <p className="text-muted-foreground">
                Discover campaigns, track performance, and grow your creator network
              </p>
            </div>
            <Button onClick={() => navigate('/campaigns')} className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Browse Campaigns</span>
            </Button>
          </div>

          {/* Profile Tabs */}
          <Tabs value={activeProfile} onValueChange={(value) => setActiveProfile(value as DashboardProfile)} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {Object.entries(profileConfigs).map(([key, config]) => {
                const IconComponent = config.icon;
                return (
                  <TabsTrigger key={key} value={key} className="flex items-center space-x-2">
                    <IconComponent className={`w-4 h-4 ${config.color}`} />
                    <span className="hidden sm:inline">{config.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Active Profile Info */}
            <div className="mt-4 p-4 bg-secondary/20 rounded-lg">
              <div className="flex items-center space-x-3">
                {(() => {
                  const IconComponent = profileConfigs[activeProfile].icon;
                  return <IconComponent className={`w-6 h-6 ${profileConfigs[activeProfile].color}`} />;
                })()}
                <div>
                  <h2 className="text-xl font-semibold">{profileConfigs[activeProfile].title}</h2>
                  <p className="text-muted-foreground">{profileConfigs[activeProfile].description}</p>
                </div>
              </div>
            </div>

            {/* Tab Contents */}
            {Object.entries(profileConfigs).map(([key, config]) => {
              const Component = config.component;
              return (
                <TabsContent key={key} value={key} className="space-y-6">
                  <Component />
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreatorDashboard;