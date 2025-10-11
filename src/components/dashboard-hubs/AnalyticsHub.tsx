import { UserRole, RoleConfig } from '@/config/roleConfig';
import AnalyticsHub from '../creator-dashboard/AnalyticsHub';

interface AnalyticsHubProps {
  role: UserRole;
  roleConfig: RoleConfig;
}

export const AnalyticsHubComponent = ({ role, roleConfig }: AnalyticsHubProps) => {
  return <AnalyticsHub />;
};

export default AnalyticsHubComponent;
