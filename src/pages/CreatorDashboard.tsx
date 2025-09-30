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

const profileConfigs = [
  { 
    id: 'management', 
    label: 'Campaign Manager', 
    icon: Music, 
    color: 'text-blue-500',
    component: CampaignManagement
  },
  { 
    id: 'analytics', 
    label: 'Analytics Hub', 
    icon: BarChart3, 
    color: 'text-green-500',
    component: AnalyticsHub
  },
  { 
    id: 'creators', 
    label: 'Social Hub', 
    icon: Users, 
    color: 'text-purple-500',
    component: ArtistRelations
  },
  { 
    id: 'settings', 
    label: 'Account Settings', 
    icon: Settings, 
    color: 'text-gray-500',
    component: AccountSettings
  }
];

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
            {profileConfigs.map((config) => {
              const IconComponent = config.icon;
              return (
                <TabsTrigger 
                  key={config.id} 
                  value={config.id} 
                  className="flex items-center gap-2"
                >
                  <IconComponent className={`w-4 h-4 ${config.color}`} />
                  <span className="hidden sm:inline">{config.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {profileConfigs.map((config) => {
            const Component = config.component;
            return (
              <TabsContent key={config.id} value={config.id} className="space-y-6">
                <Component />
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CreatorDashboard;