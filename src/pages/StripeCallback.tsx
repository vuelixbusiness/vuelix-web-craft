import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const StripeCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const error = params.get('error');
        const state = params.get('state');

        if (error) {
          throw new Error(`Stripe connection failed: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Call the callback function
        const { data, error: callbackError } = await supabase.functions.invoke('stripe-connect-callback', {
          body: { code, state, error },
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        });

        if (callbackError) throw callbackError;

        if (data?.success) {
          toast({
            title: "Success",
            description: "Stripe account connected successfully!",
          });
          
          // Close this window and redirect parent
          if (window.opener) {
            window.opener.location.reload();
            window.close();
          } else {
            navigate('/payment-methods');
          }
        }
      } catch (error) {
        console.error('Stripe callback error:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to connect Stripe account",
          variant: "destructive",
        });
        
        // Close window or redirect on error
        if (window.opener) {
          window.close();
        } else {
          navigate('/payment-methods');
        }
      } finally {
        setProcessing(false);
      }
    };

    handleCallback();
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {processing ? (
          <>
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Processing Stripe Connection</h2>
            <p className="text-muted-foreground">Please wait while we complete your connection...</p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-2">Connection Complete</h2>
            <p className="text-muted-foreground">You can close this window.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default StripeCallback;