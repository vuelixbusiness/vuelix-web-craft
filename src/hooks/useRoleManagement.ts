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
          
          // Load active role from session metadata (secure) instead of localStorage
          const { data: { session } } = await supabase.auth.getSession();
          const savedRole = session?.user?.user_metadata?.active_role;
          
          if (savedRole && roles.includes(savedRole as UserRole)) {
            setActiveRole(savedRole as UserRole);
          } else {
            // Use primary role or first available role
            const primary = data.find(r => r.is_primary);
            const defaultRole = (primary?.role as UserRole) || roles[0];
            setActiveRole(defaultRole);
            // Save to session metadata
            await supabase.auth.updateUser({
              data: { active_role: defaultRole }
            });
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

  // Listen for auth state changes to detect role switches
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (user?.id && session?.user?.user_metadata?.active_role) {
          const newRole = session.user.user_metadata.active_role as UserRole;
          
          if (newRole !== activeRole && availableRoles.includes(newRole)) {
            setActiveRole(newRole);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [user?.id, activeRole, availableRoles]);

  const switchRole = async (newRole: UserRole) => {
    if (!availableRoles.includes(newRole)) return;
    
    // Validate the role exists in database before switching
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user?.id)
      .eq('role', newRole)
      .maybeSingle();
    
    if (error || !data) {
      console.error('Invalid role or database error:', error);
      return;
    }
    
    // Store in secure session metadata instead of localStorage
    const { error: updateError } = await supabase.auth.updateUser({
      data: { active_role: newRole }
    });
    
    if (updateError) {
      console.error('Error updating session metadata:', updateError);
      return;
    }
    
    setActiveRole(newRole);
  };

  return { activeRole, availableRoles, switchRole, isLoading };
};
