import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/config/roleConfig';

export const useRoleManagement = () => {
  const { user } = useAuth();
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    const fetchRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role, is_primary')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const roles = data.map(r => r.role as UserRole);
          setAvailableRoles(roles);
          
          // Check localStorage for saved preference
          const savedRole = localStorage.getItem(`active_role_${user.id}`);
          if (savedRole && roles.includes(savedRole as UserRole)) {
            setActiveRole(savedRole as UserRole);
          } else {
            // Use primary role or first available role
            const primary = data.find(r => r.is_primary);
            setActiveRole((primary?.role as UserRole) || roles[0]);
          }
        } else {
          // Fallback to user type if no roles found
          setActiveRole((user.type as UserRole) || 'creator');
          setAvailableRoles([user.type as UserRole || 'creator']);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        // Fallback to user type
        setActiveRole((user.type as UserRole) || 'creator');
        setAvailableRoles([user.type as UserRole || 'creator']);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRoles();
  }, [user?.id, user?.type]);

  const switchRole = (newRole: UserRole) => {
    if (!availableRoles.includes(newRole)) return;
    setActiveRole(newRole);
    if (user?.id) {
      localStorage.setItem(`active_role_${user.id}`, newRole);
    }
  };

  return { activeRole, availableRoles, switchRole, isLoading };
};
