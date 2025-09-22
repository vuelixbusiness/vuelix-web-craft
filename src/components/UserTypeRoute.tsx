import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserTypeRouteProps {
  children: React.ReactNode;
  requiredUserType: 'creator' | 'artist';
  redirectTo?: string;
}

const UserTypeRoute = ({ 
  children, 
  requiredUserType, 
  redirectTo 
}: UserTypeRouteProps) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.type !== requiredUserType) {
        const defaultRedirect = user.type === 'creator' ? '/dashboard' : '/artist-dashboard';
        const targetRedirect = redirectTo || defaultRedirect;
        
        toast({
          title: "Access Restricted",
          description: `This page is only available for ${requiredUserType}s.`,
          variant: "destructive",
        });
        
        navigate(targetRedirect);
      }
    } else if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, requiredUserType, redirectTo, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user && user.type === requiredUserType ? <>{children}</> : null;
};

export default UserTypeRoute;