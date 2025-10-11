import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { getRoleConfig, UserRole } from "@/config/roleConfig";
import { Music, BarChart3, Users, Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import CampaignManagerHub from "@/components/dashboard-hubs/CampaignManagerHub";
import AnalyticsHub from "@/components/dashboard-hubs/AnalyticsHub";
import SocialHub from "@/components/dashboard-hubs/SocialHub";
import AccountSettingsHub from "@/components/dashboard-hubs/AccountSettingsHub";

type DashboardTab = 'campaign_manager' | 'analytics_hub' | 'social_hub' | 'account_settings';

const UnifiedDashboard = () => {
  const { activeRole, availableRoles, switchRole, isLoading } = useRoleManagement();
  const [activeTab, setActiveTab] = useState<DashboardTab>('campaign_manager');

  if (isLoading || !activeRole) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-6" />
          <Skeleton className="h-32 w-full mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  const roleConfig = getRoleConfig(activeRole);
  const IconComponent = roleConfig.icon;

  const tabs = [
    {
      id: 'campaign_manager' as DashboardTab,
      label: 'Campaign Manager',
      component: CampaignManagerHub,
      icon: Music,
      visible: roleConfig.modules.campaign_manager.visible
    },
    {
      id: 'analytics_hub' as DashboardTab,
      label: 'Analytics Hub',
      component: AnalyticsHub,
      icon: BarChart3,
      visible: roleConfig.modules.analytics_hub.visible
    },
    {
      id: 'social_hub' as DashboardTab,
      label: 'Social Hub',
      component: SocialHub,
      icon: Users,
      visible: roleConfig.modules.social_hub.visible
    },
    {
      id: 'account_settings' as DashboardTab,
      label: 'Account Settings',
      component: AccountSettingsHub,
      icon: Settings,
      visible: roleConfig.modules.account_settings.visible
    }
  ].filter(tab => tab.visible);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                {roleConfig.description}
              </p>
            </div>

            {availableRoles.length > 1 && (
              <Select value={activeRole} onValueChange={(value) => switchRole(value as UserRole)}>
                <SelectTrigger className="w-[200px]">
                  <div className="flex items-center space-x-2">
                    <IconComponent className={`w-4 h-4 ${roleConfig.color}`} />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => {
                    const config = getRoleConfig(role);
                    const RoleIcon = config.icon;
                    return (
                      <SelectItem key={role} value={role}>
                        <div className="flex items-center space-x-2">
                          <RoleIcon className={`w-4 h-4 ${config.color}`} />
                          <span>{config.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="mt-4 p-4 bg-secondary/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <IconComponent className={`w-6 h-6 ${roleConfig.color}`} />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold">{roleConfig.name} Mode</h2>
                  <Badge variant="secondary">{roleConfig.name}</Badge>
                </div>
                <p className="text-muted-foreground text-sm">{roleConfig.description}</p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DashboardTab)} className="w-full mt-6">
            <TabsList className={`grid w-full grid-cols-${tabs.length}`}>
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                    <TabIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {tabs.map((tab) => {
              const Component = tab.component;
              return (
                <TabsContent key={tab.id} value={tab.id} className="space-y-6 mt-6">
                  <Component role={activeRole} roleConfig={roleConfig} />
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UnifiedDashboard;
