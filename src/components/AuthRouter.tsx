import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthRouterProps {
  children: React.ReactNode;
}

const AuthRouter = ({ children }: AuthRouterProps) => {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        window.location.href = "/homepage";
      } else {
        window.location.href = "/";
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        window.location.href = "/homepage";
      } else {
        window.location.href = "/";
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xl font-medium text-foreground">Loading Vuelix...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthRouter;