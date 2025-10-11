import { UserRole, RoleConfig } from '@/config/roleConfig';
import AccountSettings from '../creator-dashboard/AccountSettings';

interface AccountSettingsHubProps {
  role: UserRole;
  roleConfig: RoleConfig;
}

export const AccountSettingsHub = ({ role, roleConfig }: AccountSettingsHubProps) => {
  return <AccountSettings />;
};

export default AccountSettingsHub;
