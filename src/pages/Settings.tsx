import DashboardLayout from "@/components/DashboardLayout";
import AccountSettingsHub from "@/components/dashboard-hubs/AccountSettingsHub";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { getRoleConfig } from "@/config/roleConfig";
import { Skeleton } from "@/components/ui/skeleton";

const Settings = () => {
  const { activeRole, isLoading } = useRoleManagement();

  if (isLoading || !activeRole) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  const roleConfig = getRoleConfig(activeRole);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
        <AccountSettingsHub role={activeRole} roleConfig={roleConfig} />
      </div>
    </DashboardLayout>
  );
};

export default Settings;
