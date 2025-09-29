import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { CreditCard, Mail } from 'lucide-react';

interface PaymentMethods {
  stripe_account_status: string;
  stripe_account_id: string | null;
  paypal_account_status: string;
  paypal_email: string | null;
}

const PaymentMethodsManager = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods | null>(null);
  const [loading, setLoading] = useState(true);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('stripe_account_status, stripe_account_id, paypal_account_status, paypal_email')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching payment methods:', error);
        return;
      }

      setPaymentMethods(data);
      setPaypalEmail(data.paypal_email || '');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectStripe = async () => {
    setUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-connect-oauth', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe Connect OAuth
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to Stripe",
          description: "Please complete the connection process in the new tab",
        });
      }
    } catch (error) {
      console.error('Error initiating Stripe connection:', error);
      toast({
        title: "Error",
        description: "Failed to initiate Stripe connection",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const connectPaypal = async () => {
    setUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('paypal-oauth', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to PayPal OAuth
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to PayPal",
          description: "Please complete the connection process in the new tab",
        });
      }
    } catch (error) {
      console.error('Error initiating PayPal connection:', error);
      toast({
        title: "Error",
        description: "Failed to initiate PayPal connection",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const refreshPaymentMethods = async () => {
    setRefreshing(true);
    try {
      await fetchPaymentMethods();
      toast({
        title: "Refreshed",
        description: "Payment method status updated",
      });
    } catch (error) {
      console.error('Error refreshing payment methods:', error);
      toast({
        title: "Error",
        description: "Failed to refresh payment methods",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <div>Loading payment methods...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Methods</h2>
          <p className="text-muted-foreground">Connect your payment accounts to receive payouts</p>
        </div>
        <Button 
          variant="outline" 
          onClick={refreshPaymentMethods} 
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Status'}
        </Button>
      </div>

      {/* Stripe Connect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Stripe
          </CardTitle>
          <CardDescription>
            Connect your Stripe account to receive payments via bank transfer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={paymentMethods?.stripe_account_status === 'connected' ? 'default' : 'secondary'}>
                {paymentMethods?.stripe_account_status === 'connected' ? 'Connected' : 'Not Connected'}
              </Badge>
              {paymentMethods?.stripe_account_id && (
                <span className="text-sm text-muted-foreground">
                  ID: {paymentMethods.stripe_account_id}
                </span>
              )}
            </div>
            {paymentMethods?.stripe_account_status !== 'connected' && (
              <Button onClick={connectStripe} disabled={updating}>
                {updating ? 'Connecting...' : 'Connect Stripe'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PayPal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            PayPal
          </CardTitle>
          <CardDescription>
            Enter your PayPal email to receive payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={paymentMethods?.paypal_account_status === 'connected' ? 'default' : 'secondary'}>
                {paymentMethods?.paypal_account_status === 'connected' ? 'Connected' : 'Not Connected'}
              </Badge>
              {paymentMethods?.paypal_email && (
                <span className="text-sm text-muted-foreground">
                  {paymentMethods.paypal_email}
                </span>
              )}
            </div>
            {paymentMethods?.paypal_account_status !== 'connected' && (
              <Button onClick={connectPaypal} disabled={updating}>
                {updating ? 'Connecting...' : 'Connect PayPal'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentMethodsManager;