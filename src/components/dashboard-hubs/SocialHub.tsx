import { UserRole, RoleConfig } from '@/config/roleConfig';
import ArtistRelations from '../creator-dashboard/ArtistRelations';

interface SocialHubProps {
  role: UserRole;
  roleConfig: RoleConfig;
}

export const SocialHub = ({ role, roleConfig }: SocialHubProps) => {
  return <ArtistRelations />;
};

export default SocialHub;
